import os
import re
from pathlib import Path
from urllib.parse import urlparse

import psycopg2
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from pix_framework.discovery.batch_processing.batch_characteristics import discover_batch_processing_and_characteristics
from pix_framework.enhancement.start_time_estimator.config import (
    Configuration,
    ConcurrencyOracleType,
    ReEstimationMethod,
    ResourceAvailabilityType,
)
from pix_framework.enhancement.start_time_estimator.estimator import StartTimeEstimator
from pix_framework.io.event_log import EventLogIDs, read_csv_log
from psycopg2 import sql

ALLOWED_ORIGINS = ["*"]

app = Flask(__name__)
resources = {
    r"/overview/*": {"origins": ALLOWED_ORIGINS},
    r"/case_overview/*": {"origins": ALLOWED_ORIGINS},
    r"/daily_summary/*": {"origins": ALLOWED_ORIGINS},
    r"/activity_transitions/*": {"origins": ALLOWED_ORIGINS},
    r"/activity_date_range_global/*": {"origins": ALLOWED_ORIGINS},
    r"/activity_pairs/*": {"origins": ALLOWED_ORIGINS},
    r"/activity_transitions_by_resource/*": {"origins": ALLOWED_ORIGINS},
    r"/potential_cte/*": {"origins": ALLOWED_ORIGINS},
    r"/cte_improvement/*": {"origins": ALLOWED_ORIGINS},
    r"/wt_overview/*": {"origins": ALLOWED_ORIGINS},
    r"/process_csv/*": {"origins": ALLOWED_ORIGINS},
}

CORS(app, resources=resources)


class DBHandler:
    def __init__(self):
        pass

    @staticmethod
    def sanitize_table_name(name):
        pattern = re.compile(r"[^a-zA-Z0-9]")
        return pattern.sub("_", name)

    @staticmethod
    def get_db_connection():
        try:
            database_url = os.environ.get("DATABASE_URL")
            if database_url:
                # Parse the DATABASE_URL
                result = urlparse(database_url)
                connection = psycopg2.connect(
                    database=result.path[1:],  # Trim the leading slash
                    user=result.username,
                    password=result.password,
                    host=result.hostname,
                    port=result.port,
                )
                return connection
            else:
                print("DATABASE_URL not set in environment.")
                return None
        except Exception as e:
            print("Error connecting to the database:", e)
            return None


@app.route("/create_table/<jobid>", methods=["POST"])
def create_table(jobid):
    csv_data = request.data.decode("utf-8")

    # rename headers to match database column names
    #
    # CSV headers: start_time, end_time, source_activity, source_resource, destination_activity, destination_resource,
    #   case_id, wt_total, wt_contention, wt_batching, wt_prioritization, wt_unavailability, wt_extraneous
    csv_lines = csv_data.split("\n")
    csv_headers = csv_lines[0]
    csv_headers = csv_headers.replace("start_time", "StartTime")
    csv_headers = csv_headers.replace("end_time", "EndTime")
    csv_headers = csv_headers.replace("source_activity", "SourceActivity")
    csv_headers = csv_headers.replace("source_resource", "SourceResource")
    csv_headers = csv_headers.replace("destination_activity", "DestinationActivity")
    csv_headers = csv_headers.replace("destination_resource", "DestinationResource")
    csv_headers = csv_headers.replace("case_id", "CaseID")
    csv_headers = csv_headers.replace("wt_total", "WtTotal")
    csv_headers = csv_headers.replace("wt_contention", "WtContention")
    csv_headers = csv_headers.replace("wt_batching", "WtBatching")
    csv_headers = csv_headers.replace("wt_prioritization", "WtPrioritization")
    csv_headers = csv_headers.replace("wt_unavailability", "WtUnavailability")
    csv_headers = csv_headers.replace("wt_extraneous", "WtExtraneous")
    csv_lines[0] = csv_headers
    csv_data = "\n".join(csv_lines)

    # save CSV data to temporary file
    csv_path = Path(str(jobid)).with_suffix(".csv")
    csv_path.write_text(csv_data)

    # prepare table name
    sanitized_jobid = DBHandler.sanitize_table_name(jobid)
    table_name = f"result_{sanitized_jobid}"

    conn = DBHandler.get_db_connection()
    if conn is None:
        return jsonify({"error": "Could not connect to database"}), 500

    # create table
    try:
        cur = conn.cursor()
        cur.execute(
            sql.SQL(
                """
            CREATE TABLE {} (
                StartTime TIMESTAMP,
                EndTime TIMESTAMP,
                SourceActivity TEXT,
                SourceResource TEXT,
                DestinationActivity TEXT,
                DestinationResource TEXT,
                CaseID TEXT,
                WtTotal FLOAT,
                WtContention FLOAT,
                WtBatching FLOAT,
                WtPrioritization FLOAT,
                WtUnavailability FLOAT,
                WtExtraneous FLOAT
            )
        """
            ).format(sql.Identifier(table_name))
        )
        conn.commit()
        cur.close()
    except Exception as e:
        print("Error creating table:", e)
        return jsonify({"error": "An error occurred while processing your request"}), 500

    # import CSV
    try:
        cur = conn.cursor()
        with csv_path.open("r") as f:
            cur.copy_expert(sql.SQL("COPY {} FROM STDIN WITH CSV HEADER").format(sql.Identifier(table_name)), f)
        conn.commit()
        cur.close()
    except Exception as e:
        print("Error inserting data:", e)
        return jsonify({"error": "An error occurred while processing your request"}), 500

    # delete temporary file
    os.remove(csv_path)

    return jsonify({"message": "Table created successfully", "table_name": table_name})


@app.route("/process_csv/<jobid>", methods=["GET"])
def process_csv(jobid):
    csv_url = f"http://154.56.63.127:8080/assets/results/{jobid}/event_log.csv"
    response = requests.get(csv_url)

    if response.status_code != 200:
        return jsonify({"error": f"Failed to retrieve CSV for jobid {jobid}"}), 500

    csv_data = response.content.decode("utf-8")
    csv_file = "temporary.csv"
    with open(csv_file, "w") as f:
        f.write(csv_data)

    case_column = request.args.get("case", default="case")
    activity_column = request.args.get("activity", default="activity")
    start_time_column = request.args.get("start_timestamp", default="start_time")
    end_time_column = request.args.get("end_timestamp", default="end_time")
    resource_column = request.args.get("resource", default="resource")

    event_log = read_csv_log(
        log_path=csv_file,
        log_ids=EventLogIDs(
            case=case_column,
            activity=activity_column,
            start_time=start_time_column,
            end_time=end_time_column,
            resource=resource_column,
        ),
        sort=False,
    )

    configuration = Configuration(
        log_ids=EventLogIDs(
            case=case_column,
            activity=activity_column,
            start_time=start_time_column,
            end_time=end_time_column,
            resource=resource_column,
        ),
        concurrency_oracle_type=ConcurrencyOracleType.HEURISTICS,
        re_estimation_method=ReEstimationMethod.MODE,
        resource_availability_type=ResourceAvailabilityType.SIMPLE,
    )

    print(configuration)

    # Step 3: Process the data using your library/methods
    extended_event_log = StartTimeEstimator(event_log, configuration).estimate()
    batch_characteristics = discover_batch_processing_and_characteristics(
        event_log=extended_event_log,
        log_ids=EventLogIDs(
            case=case_column,
            activity=activity_column,
            start_time=start_time_column,
            end_time=end_time_column,
            resource=resource_column,
        ),
    )

    # os.remove(csv_file)

    return jsonify(batch_characteristics)


@app.route("/overview/<jobid>", methods=["GET"])
def overview(jobid):
    sanitized_jobid = DBHandler.sanitize_table_name(jobid)
    table_name = f"result_{sanitized_jobid}"

    conn = DBHandler.get_db_connection()
    if conn is None:
        return jsonify({"error": "Could not connect to database"}), 500

    try:
        cur = conn.cursor()

        # Count unique elements in caseid column
        cur.execute(sql.SQL("SELECT COUNT(DISTINCT caseid) FROM {}").format(sql.Identifier(table_name)))
        unique_caseid_count = cur.fetchone()[0]

        # Sum of each column
        cur.execute(
            sql.SQL(
                "SELECT SUM(wtcontention), SUM(wtbatching), SUM(wtprioritization), SUM(wtunavailability), SUM(wtextraneous) FROM {}"
            ).format(sql.Identifier(table_name))
        )
        sums = cur.fetchone()
        sum_dict = {
            "total_contention_wt": sums[0],
            "total_batching_wt": sums[1],
            "total_prioritization_wt": sums[2],
            "total_unavailability_wt": sums[3],
            "total_extraneous_wt": sums[4],
        }

        cur.execute(
            sql.SQL(
                """
            SELECT
                AVG(wtcontention),
                AVG(wtbatching),
                AVG(wtprioritization),
                AVG(wtunavailability),
                AVG(wtextraneous)
            FROM {}
        """
            ).format(sql.Identifier(table_name))
        )
        averages = cur.fetchone()
        avg_dict = {
            "avg_contention_wt": averages[0],
            "avg_batching_wt": averages[1],
            "avg_prioritization_wt": averages[2],
            "avg_unavailability_wt": averages[3],
            "avg_extraneous_wt": averages[4],
        }

        # Count unique elements in sourceactivity column
        cur.execute(
            sql.SQL(
                """
            SELECT COUNT(*) FROM (
                SELECT DISTINCT sourceactivity FROM {}
                UNION
                SELECT DISTINCT destinationactivity FROM {}
            ) AS combined
            """
            ).format(sql.Identifier(table_name), sql.Identifier(table_name))
        )
        unique_sourceactivity_count = cur.fetchone()[0]

        # Count total number of rows
        cur.execute(sql.SQL("SELECT COUNT(*) FROM {}").format(sql.Identifier(table_name)))
        total_rows = cur.fetchone()[0]

        # Sum of wttotal column
        cur.execute(sql.SQL("SELECT SUM(wttotal) FROM {}").format(sql.Identifier(table_name)))
        waiting_time = cur.fetchone()[0]

        # Avg of wttotal column
        cur.execute(sql.SQL("SELECT AVG(wttotal) FROM {}").format(sql.Identifier(table_name)))
        waiting_time_avg = cur.fetchone()[0]

        # Sum(endtime - starttime)
        cur.execute(
            sql.SQL("SELECT SUM(EXTRACT(EPOCH FROM (endtime - starttime)))::FLOAT FROM {}").format(
                sql.Identifier(table_name)
            )
        )
        processing_time = cur.fetchone()[0]

        # AVG (endtime - starttime)
        cur.execute(
            sql.SQL("SELECT AVG(EXTRACT(EPOCH FROM (endtime - starttime)))::FLOAT FROM {}").format(
                sql.Identifier(table_name)
            )
        )
        processing_time_avg = cur.fetchone()[0]

        cur.close()
        conn.close()

        return jsonify(
            {
                "num_cases": unique_caseid_count,
                "sums": sum_dict,
                "num_activities": unique_sourceactivity_count,
                "num_transitions": total_rows,
                "waiting_time": waiting_time,
                "processing_time": processing_time,
                "waiting_time_avg": waiting_time_avg,
                "processing_time_avg": processing_time_avg,
                "avg": avg_dict,
            }
        )

    except Exception as e:
        print("Error executing query:", e)
        return jsonify({"error": "An error occurred while processing your request"}), 500


@app.route("/wt_overview/<jobid>/<wt_type>", methods=["GET"])
def wt_overview(jobid, wt_type):
    # Validate wt_type
    valid_wt_types = ["batching", "prioritization", "extraneous", "contention", "unavailability"]

    if wt_type not in valid_wt_types:
        return jsonify({"error": "Invalid waiting time type"}), 400

    sanitized_jobid = DBHandler.sanitize_table_name(jobid)
    table_name = f"result_{sanitized_jobid}"

    conn = DBHandler.get_db_connection()
    if conn is None:
        return jsonify({"error": "Could not connect to database"}), 500

    try:
        cur = conn.cursor()

        # Calculate sum of specific wt_type
        cur.execute(
            sql.SQL("SELECT SUM({}) FROM {}").format(sql.Identifier("wt" + wt_type), sql.Identifier(table_name))
        )
        wt_sum = cur.fetchone()[0]

        # Calculate total wt
        cur.execute(sql.SQL("SELECT SUM(wttotal) FROM {}").format(sql.Identifier(table_name)))
        total_wttotal_sum = cur.fetchone()[0]

        # Count unique elements in caseid column
        cur.execute(sql.SQL("SELECT COUNT(DISTINCT caseid) FROM {}").format(sql.Identifier(table_name)))
        unique_caseid_count = cur.fetchone()[0]

        # Calculate the number of unique caseid where specific wt_type > 0
        cur.execute(
            sql.SQL(
                """
            SELECT DISTINCT caseid FROM {} WHERE {} > 0
        """
            ).format(sql.Identifier(table_name), sql.Identifier("wt" + wt_type))
        )
        distinct_cases_with_wt = len(cur.fetchall())

        # Find the biggest pair of sourceactivity and destinationactivity for the specific wt_type
        cur.execute(
            sql.SQL(
                """
            SELECT sourceactivity, destinationactivity, SUM({})
            FROM {} GROUP BY sourceactivity, destinationactivity
            ORDER BY SUM({}) DESC LIMIT 1
        """
            ).format(sql.Identifier("wt" + wt_type), sql.Identifier(table_name), sql.Identifier("wt" + wt_type))
        )
        biggest_source_dest_pair = cur.fetchone()

        # Find the biggest resource with the specific wt_type
        cur.execute(
            sql.SQL(
                """
            SELECT destinationresource, SUM({})
            FROM {} GROUP BY destinationresource
            ORDER BY SUM({}) DESC LIMIT 1
        """
            ).format(sql.Identifier("wt" + wt_type), sql.Identifier(table_name), sql.Identifier("wt" + wt_type))
        )
        biggest_resource = cur.fetchone()

        cur.close()
        conn.close()

        return jsonify(
            {
                "wt_sum": wt_sum,
                "total_wt_sum": total_wttotal_sum,
                "distinct_cases": distinct_cases_with_wt,
                "biggest_source_dest_pair": biggest_source_dest_pair,
                "biggest_resource": biggest_resource,
                "cases": unique_caseid_count,
            }
        )

    except Exception as e:
        print("Error executing query:", e)
        return jsonify({"error": "An error occurred while processing your request"}), 500


@app.route("/wt_overview/<jobid>/<wt_type>/<sourceactivity>/<destinationactivity>", methods=["GET"])
def wt_overview_activity(jobid, wt_type, sourceactivity, destinationactivity):
    # Validate wt_type
    valid_wt_types = ["batching", "prioritization", "extraneous", "contention", "unavailability"]

    if wt_type not in valid_wt_types:
        return jsonify({"error": "Invalid waiting time type"}), 400

    sanitized_jobid = DBHandler.sanitize_table_name(jobid)
    table_name = f"result_{sanitized_jobid}"

    conn = DBHandler.get_db_connection()
    if conn is None:
        return jsonify({"error": "Could not connect to database"}), 500

    try:
        cur = conn.cursor()

        conditions = sql.SQL(" WHERE sourceactivity = %s AND destinationactivity = %s ")

        # Calculate sum of specific wt_type
        query = sql.SQL(
            "SELECT SUM({column}) FROM {table_name} WHERE sourceactivity = %s AND destinationactivity = %s"
        ).format(column=sql.Identifier("wt" + wt_type), table_name=sql.Identifier(table_name))

        cur.execute(query, (sourceactivity, destinationactivity))
        wt_sum = cur.fetchone()[0]

        # Calculate total wt
        cur.execute(sql.SQL("SELECT SUM(wttotal) FROM {}").format(sql.Identifier(table_name)))
        total_wttotal_sum = cur.fetchone()[0]

        # Count unique elements in caseid column
        cur.execute(sql.SQL("SELECT COUNT(DISTINCT caseid) FROM {}").format(sql.Identifier(table_name)))
        unique_caseid_count = cur.fetchone()[0]

        # Calculate the number of unique caseid where specific wt_type > 0
        cur.execute(
            sql.SQL(
                """
            SELECT DISTINCT caseid FROM {} WHERE {} > 0 AND sourceactivity = %s AND destinationactivity = %s
        """
            ).format(sql.Identifier(table_name), sql.Identifier("wt" + wt_type)),
            (sourceactivity, destinationactivity),
        )
        distinct_cases_with_wt = len(cur.fetchall())

        # Find the biggest resource with the specific wt_type
        query = sql.SQL(
            """
            SELECT destinationresource, SUM({column_name})
            FROM {table_name} WHERE sourceactivity = %s AND destinationactivity = %s
            GROUP BY destinationresource
            ORDER BY SUM({column_name}) DESC LIMIT 1
        """
        ).format(column_name=sql.Identifier("wt" + wt_type), table_name=sql.Identifier(table_name))

        cur.execute(query, (sourceactivity, destinationactivity))
        biggest_resource = cur.fetchone()

        # Find the biggest sourceresource and destinationresource pair with the biggest wt time of our type
        query = sql.SQL(
            """
            SELECT sourceresource, destinationresource, SUM({column_name})
            FROM {table_name} WHERE sourceactivity = %s AND destinationactivity = %s
            GROUP BY sourceresource, destinationresource
            ORDER BY SUM({column_name}) DESC LIMIT 1
        """
        ).format(column_name=sql.Identifier("wt" + wt_type), table_name=sql.Identifier(table_name))

        cur.execute(query, (sourceactivity, destinationactivity))
        biggest_source_dest_resource_pair = cur.fetchone()

        cur.close()
        conn.close()

        response_data = {
            "wt_sum": wt_sum,
            "total_wt_sum": total_wttotal_sum,
            "distinct_cases": distinct_cases_with_wt,
            "biggest_source_dest_resource_pair": biggest_source_dest_resource_pair,
            "biggest_resource": biggest_resource,
            "cases": unique_caseid_count,
        }

        response_data = {key: 0 if value is None else value for key, value in response_data.items()}

        return jsonify(response_data)

    except Exception as e:
        print("Error executing query:", e)
        return jsonify({"error": "An error occurred while processing your request"}), 500


@app.route("/potential_cte/<jobid>", methods=["GET"])
def potential_cte(jobid):
    sanitized_jobid = DBHandler.sanitize_table_name(jobid)
    table_name = f"result_{sanitized_jobid}"

    conn = DBHandler.get_db_connection()
    if conn is None:
        return jsonify({"error": "Could not connect to database"}), 500

    try:
        cur = conn.cursor()

        # Calculate processing_time
        cur.execute(
            sql.SQL(
                """
            SELECT SUM(EXTRACT(EPOCH FROM (endtime - starttime)))::FLOAT FROM {}
        """
            ).format(sql.Identifier(table_name))
        )
        processing_time = cur.fetchone()[0]

        # Calculate the sum of waiting times for each type
        cur.execute(
            sql.SQL(
                """
            SELECT SUM(wtcontention), SUM(wtbatching), SUM(wtprioritization), SUM(wtunavailability), SUM(wtextraneous) FROM {}
        """
            ).format(sql.Identifier(table_name))
        )
        sums = cur.fetchone()

        # Close cursor and connection
        cur.close()
        conn.close()

        # Calculate percentages
        total_time = {}
        keys = ["Contention", "Batching", "Prioritization", "Unavailability", "Extraneous"]
        for i, key in enumerate(keys):
            total_time_without_key = sum(sums) - sums[i]
            percentage = (processing_time / (processing_time + total_time_without_key)) * 100
            total_time[key] = round(percentage, 1)

        return jsonify(total_time)

    except Exception as e:
        print("Error executing query:", e)
        return jsonify({"error": "An error occurred while processing your request"}), 500


@app.route("/potential_cte_filtered/<jobid>/<source_activity>/<destination_activity>", methods=["GET"])
def potential_cte_filtered(jobid, source_activity, destination_activity):
    sanitized_jobid = DBHandler.sanitize_table_name(jobid)
    table_name = f"result_{sanitized_jobid}"

    conn = DBHandler.get_db_connection()
    if conn is None:
        return jsonify({"error": "Could not connect to database"}), 500

    try:
        cur = conn.cursor()

        # Calculate processing_time
        cur.execute(
            sql.SQL(
                """
            SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (endtime - starttime)))::FLOAT, 0)
            FROM {}
            WHERE sourceactivity = %s AND destinationactivity = %s
        """
            ).format(sql.Identifier(table_name)),
            [source_activity, destination_activity],
        )
        processing_time = cur.fetchone()[0]
        print(f"Processing time: {processing_time}")

        # Calculate the sum of waiting times for each type
        cur.execute(
            sql.SQL(
                """
            SELECT COALESCE(SUM(wtcontention), 0), COALESCE(SUM(wtbatching), 0), COALESCE(SUM(wtprioritization), 0), COALESCE(SUM(wtunavailability), 0), COALESCE(SUM(wtextraneous), 0)
            FROM {}
            WHERE sourceactivity = %s AND destinationactivity = %s
        """
            ).format(sql.Identifier(table_name)),
            [source_activity, destination_activity],
        )
        sums = cur.fetchone()
        print(f"Waiting time sums: {sums}")

        # Close cursor and connection
        cur.close()
        conn.close()

        # Calculate percentages
        total_time = {}
        keys = ["Contention", "Batching", "Prioritization", "Unavailability", "Extraneous"]
        for i, key in enumerate(keys):
            total_time_without_key = sum(sums) - sums[i]
            if processing_time + total_time_without_key == 0:
                percentage = 0.0
            else:
                percentage = (processing_time / (processing_time + total_time_without_key)) * 100
            total_time[key] = round(percentage, 1)

        return jsonify(total_time)

    except Exception as e:
        print(f"Error executing query: {e}")
        return jsonify({"error": "An error occurred while processing your request"}), 500


@app.route("/cte_improvement/<jobid>", methods=["GET"])
def cte_improvement(jobid):
    sanitized_jobid = DBHandler.sanitize_table_name(jobid)
    table_name = f"result_{sanitized_jobid}"

    conn = DBHandler.get_db_connection()
    if conn is None:
        return jsonify({"error": "Could not connect to database"}), 500

    try:
        cur = conn.cursor()

        # Calculate pt_total and wt_total
        cur.execute(
            sql.SQL(
                """
            SELECT
                SUM(EXTRACT(EPOCH FROM (endtime - starttime)))::FLOAT,
                SUM(wttotal)
            FROM {}
        """
            ).format(sql.Identifier(table_name))
        )
        pt_total, wt_total = cur.fetchone()

        # Calculate transition aggregates
        cur.execute(
            sql.SQL(
                """
            SELECT
                sourceactivity,
                destinationactivity,
                SUM(wttotal),
                SUM(wtcontention),
                SUM(wtbatching),
                SUM(wtprioritization),
                SUM(wtunavailability),
                SUM(wtextraneous)
            FROM {}
            GROUP BY sourceactivity, destinationactivity
        """
            ).format(sql.Identifier(table_name))
        )
        transitions = cur.fetchall()

        # Calculate the values for each transition
        results = []
        for t in transitions:
            source, dest, wt, wc, wb, wp, wu, we = t
            transition_value = pt_total / (pt_total + wt_total - wt)
            contention_value = pt_total / (pt_total + wt_total - wc)
            batching_value = pt_total / (pt_total + wt_total - wb)
            prioritization_value = pt_total / (pt_total + wt_total - wp)
            unavailability_value = pt_total / (pt_total + wt_total - wu)
            extraneous_value = pt_total / (pt_total + wt_total - we)

            results.append(
                {
                    "source_activity": source,
                    "target_activity": dest,
                    "cte_impact_total": transition_value * 100,
                    "cte_impact": {
                        "batching_impact": batching_value * 100,
                        "prioritization_impact": prioritization_value * 100,
                        "contention_impact": contention_value * 100,
                        "unavailability_impact": unavailability_value * 100,
                        "extraneous_impact": extraneous_value * 100,
                    },
                    "total_wt": wt,
                }
            )

        # Sort and limit the results
        results.sort(key=lambda x: x["cte_impact_total"], reverse=True)

        # Close cursor and connection
        cur.close()
        conn.close()

        return jsonify({"data": results, "total_pt": pt_total, "total_wt": wt_total})

    except Exception as e:
        print("Error executing query:", e)
        return jsonify({"error": "An error occurred while processing your request"}), 500


@app.route("/case_overview/<jobid>/<sourceactivity>/<destinationactivity>", methods=["GET"])
def case_overview(jobid, sourceactivity, destinationactivity):
    sanitized_jobid = DBHandler.sanitize_table_name(jobid)
    table_name = f"result_{sanitized_jobid}"

    conn = DBHandler.get_db_connection()
    if conn is None:
        return jsonify({"error": "Could not connect to database"}), 500

    try:
        cur = conn.cursor()

        cur.execute(
            sql.SQL(
                """
            SELECT sourceresource, destinationresource, MAX(wttotal)
            FROM {} WHERE sourceactivity = %s AND destinationactivity = %s
            GROUP BY sourceresource, destinationresource
            ORDER BY MAX(wttotal) DESC
            LIMIT 1
        """
            ).format(sql.Identifier(table_name)),
            (sourceactivity, destinationactivity),
        )
        max_wttotal_pair = cur.fetchone()

        # Count unique elements in caseid column where sourceactivity and destinationactivity match
        cur.execute(
            sql.SQL(
                """
            SELECT COUNT(DISTINCT caseid) FROM {} WHERE sourceactivity = %s AND destinationactivity = %s
        """
            ).format(sql.Identifier(table_name)),
            (sourceactivity, destinationactivity),
        )
        specific_caseid_count = cur.fetchone()[0]

        # Count unique elements in caseid column (total)
        cur.execute(sql.SQL("SELECT COUNT(DISTINCT caseid) FROM {}").format(sql.Identifier(table_name)))
        total_caseid_count = cur.fetchone()[0]

        # Sum of wttotal where sourceactivity and destinationactivity match
        cur.execute(
            sql.SQL(
                """
            SELECT SUM(wttotal) FROM {} WHERE sourceactivity = %s AND destinationactivity = %s
        """
            ).format(sql.Identifier(table_name)),
            (sourceactivity, destinationactivity),
        )
        specific_wttotal_sum = cur.fetchone()[0]

        # Sum of wttotal in all rows
        cur.execute(sql.SQL("SELECT SUM(wttotal) FROM {}").format(sql.Identifier(table_name)))
        total_wttotal_sum = cur.fetchone()[0]

        # Sum of each wt where sourceactivity and destinationactivity match
        cur.execute(
            sql.SQL(
                """
            SELECT SUM(wtcontention), SUM(wtbatching), SUM(wtprioritization), SUM(wtunavailability), SUM(wtextraneous)
            FROM {} WHERE sourceactivity = %s AND destinationactivity = %s
        """
            ).format(sql.Identifier(table_name)),
            (sourceactivity, destinationactivity),
        )
        specific_sums = cur.fetchone()
        specific_sum_dict = {
            "contention_wt": specific_sums[0],
            "batching_wt": specific_sums[1],
            "prioritization_wt": specific_sums[2],
            "unavailability_wt": specific_sums[3],
            "extraneous_wt": specific_sums[4],
        }

        cur.execute(
            sql.SQL(
                """
            SELECT SUM(endtime - starttime) FROM {} WHERE sourceactivity = %s AND destinationactivity = %s
        """
            ).format(sql.Identifier(table_name)),
            (sourceactivity, destinationactivity),
        )
        fetch_result = cur.fetchone()
        time_diff = fetch_result[0] if fetch_result is not None else None
        processing_time = time_diff.total_seconds() if time_diff else 0

        cur.close()
        conn.close()

        return jsonify(
            {
                "specific_case_count": specific_caseid_count,
                "total_case_count": total_caseid_count,
                "specific_wttotal_sum": specific_wttotal_sum,
                "total_wttotal_sum": total_wttotal_sum,
                "specific_sums": specific_sum_dict,
                "max_wttotal_pair": max_wttotal_pair,
                "processing_time": processing_time,
            }
        )

    except Exception as e:
        print("Error executing query:", e)
        return jsonify({"error": "An error occurred while processing your request"}), 500


@app.route("/daily_summary/<jobid>", methods=["GET"])
def daily_summary(jobid):
    sanitized_jobid = DBHandler.sanitize_table_name(jobid)
    table_name = f"result_{sanitized_jobid}"

    conn = DBHandler.get_db_connection()
    if conn is None:
        return jsonify({"error": "Could not connect to database"}), 500

    try:
        cur = conn.cursor()

        # Group by day and sum up the waiting times
        query = sql.SQL(
            """
            SELECT
                DATE(starttime) as day,
                SUM(wtcontention) as total_contention_wt,
                SUM(wtbatching) as total_batching_wt,
                SUM(wtprioritization) as total_prioritization_wt,
                SUM(wtunavailability) as total_unavailability_wt,
                SUM(wtextraneous) as total_extraneous_wt
            FROM {}
            GROUP BY day
            ORDER BY day
        """
        ).format(sql.Identifier(table_name))

        cur.execute(query)
        rows = cur.fetchall()

        # Convert the result to a list of dictionaries
        result = []
        for row in rows:
            result.append(
                {
                    "day": row[0].strftime("%Y-%m-%d"),  # Assuming the date is a datetime object
                    "total_contention_wt": row[1],
                    "total_batching_wt": row[2],
                    "total_prioritization_wt": row[3],
                    "total_unavailability_wt": row[4],
                    "total_extraneous_wt": row[5],
                }
            )

        cur.close()
        conn.close()

        return jsonify(result)

    except Exception as e:
        print("Error executing query:", e)
        return jsonify({"error": "An error occurred while processing your request"}), 500


@app.route("/daily_summary/<jobid>/<sourceactivity>/<destinationactivity>", methods=["GET"])
def daily_summary_specific_pair(jobid, sourceactivity, destinationactivity):
    sanitized_jobid = DBHandler.sanitize_table_name(jobid)
    table_name = f"result_{sanitized_jobid}"

    conn = DBHandler.get_db_connection()
    if conn is None:
        return jsonify({"error": "Could not connect to database"}), 500

    try:
        cur = conn.cursor()

        # Group by day and sum up the waiting times for the specific sourceactivity and destinationactivity pair
        query = sql.SQL(
            """
            SELECT
                DATE(starttime) as day,
                SUM(wtcontention) as total_contention_wt,
                SUM(wtbatching) as total_batching_wt,
                SUM(wtprioritization) as total_prioritization_wt,
                SUM(wtunavailability) as total_unavailability_wt,
                SUM(wtextraneous) as total_extraneous_wt
            FROM {}
            WHERE sourceactivity = %s AND destinationactivity = %s
            GROUP BY day
            ORDER BY day
        """
        ).format(sql.Identifier(table_name))

        cur.execute(query, (sourceactivity, destinationactivity))
        rows = cur.fetchall()

        # Convert the result to a list of dictionaries
        result = []
        for row in rows:
            result.append(
                {
                    "day": row[0].strftime("%Y-%m-%d"),  # Assuming the date is a datetime object
                    "total_contention_wt": row[1],
                    "total_batching_wt": row[2],
                    "total_prioritization_wt": row[3],
                    "total_unavailability_wt": row[4],
                    "total_extraneous_wt": row[5],
                }
            )

        cur.close()
        conn.close()

        return jsonify(result)

    except Exception as e:
        print("Error executing query:", e)
        return jsonify({"error": "An error occurred while processing your request"}), 500


@app.route("/activity_transitions/<jobid>", methods=["GET"])
def activity_transitions(jobid):
    sanitized_jobid = DBHandler.sanitize_table_name(jobid)
    table_name = f"result_{sanitized_jobid}"

    conn = DBHandler.get_db_connection()
    if conn is None:
        return jsonify({"error": "Could not connect to database"}), 500

    try:
        cur = conn.cursor()

        # Sum up waiting times for all combinations of sourceactivity and destinationactivity
        query = sql.SQL(
            """
            SELECT
                sourceactivity,
                destinationactivity,
                SUM(wttotal) as total_wt,
                SUM(wtcontention) as contention_wt,
                SUM(wtbatching) as batching_wt,
                SUM(wtprioritization) as prioritization_wt,
                SUM(wtunavailability) as unavailability_wt,
                SUM(wtextraneous) as extraneous_wt
            FROM {}
            GROUP BY sourceactivity, destinationactivity
            ORDER BY total_wt DESC
        """
        ).format(sql.Identifier(table_name))

        cur.execute(query)
        rows = cur.fetchall()

        # Convert the result to a list of dictionaries
        result = []
        for row in rows:
            result.append(
                {
                    "source_activity": row[1],
                    "target_activity": row[0],
                    "total_wt": row[2],
                    "contention_wt": row[3],
                    "batching_wt": row[4],
                    "prioritization_wt": row[5],
                    "unavailability_wt": row[6],
                    "extraneous_wt": row[7],
                }
            )

        cur.close()
        conn.close()

        return jsonify(result)

    except Exception as e:
        print("Error executing query:", e)
        return jsonify({"error": "An error occurred while processing your request"}), 500


@app.route("/activity_transitions_by_resource/<jobid>/<sourceactivity>/<destinationactivity>", methods=["GET"])
def activity_transitions_by_resource(jobid, sourceactivity, destinationactivity):
    sanitized_jobid = DBHandler.sanitize_table_name(jobid)
    table_name = f"result_{sanitized_jobid}"

    conn = DBHandler.get_db_connection()
    if conn is None:
        return jsonify({"error": "Could not connect to database"}), 500

    try:
        cur = conn.cursor()

        # Sum up waiting times for all combinations of sourceresource and targetresource
        query = sql.SQL(
            """
            SELECT
                sourceresource,
                destinationresource,
                SUM(wttotal) as total_wt,
                SUM(wtcontention) as contention_wt,
                SUM(wtbatching) as batching_wt,
                SUM(wtprioritization) as prioritization_wt,
                SUM(wtunavailability) as unavailability_wt,
                SUM(wtextraneous) as extraneous_wt
            FROM {}
            WHERE sourceactivity = %s AND destinationactivity = %s
            GROUP BY sourceresource, destinationresource
            ORDER BY total_wt DESC
        """
        ).format(sql.Identifier(table_name))

        cur.execute(query, (sourceactivity, destinationactivity))
        rows = cur.fetchall()

        # Convert the result to a list of dictionaries
        result = []
        for row in rows:
            result.append(
                {
                    "source_resource": row[0],
                    "target_resource": row[1],
                    "total_wt": row[2],
                    "contention_wt": row[3],
                    "batching_wt": row[4],
                    "prioritization_wt": row[5],
                    "unavailability_wt": row[6],
                    "extraneous_wt": row[7],
                }
            )

        cur.close()
        conn.close()

        return jsonify(result)

    except Exception as e:
        print("Error executing query:", e)
        return jsonify({"error": "An error occurred while processing your request"}), 500


@app.route("/activity_transitions/<jobid>/<sourceactivity>/<targetactivity>", methods=["GET"])
def specific_activity_transitions(jobid, sourceactivity, targetactivity):
    sanitized_jobid = DBHandler.sanitize_table_name(jobid)
    table_name = f"result_{sanitized_jobid}"

    conn = DBHandler.get_db_connection()
    if conn is None:
        return jsonify({"error": "Could not connect to database"}), 500

    try:
        cur = conn.cursor()

        # Sum up waiting times for the specific combination of sourceactivity and destinationactivity
        query = sql.SQL(
            """
            SELECT
                sourceactivity,
                destinationactivity,
                SUM(wttotal) as total_wt,
                SUM(wtcontention) as contention_wt,
                SUM(wtbatching) as batching_wt,
                SUM(wtprioritization) as prioritization_wt,
                SUM(wtunavailability) as unavailability_wt,
                SUM(wtextraneous) as extraneous_wt
            FROM {}
            WHERE sourceactivity = %s AND destinationactivity = %s
            GROUP BY sourceactivity, destinationactivity
        """
        ).format(sql.Identifier(table_name))

        cur.execute(query, (sourceactivity, targetactivity))
        row = cur.fetchone()

        if row is None:
            return jsonify({}), 200

        result = {
            "source_activity": row[1],
            "target_activity": row[0],
            "total_wt": row[2],
            "contention_wt": row[3],
            "batching_wt": row[4],
            "prioritization_wt": row[5],
            "unavailability_wt": row[6],
            "extraneous_wt": row[7],
        }

        cur.close()
        conn.close()

        return jsonify(result)

    except Exception as e:
        print("Error executing query:", e)
        return jsonify({"error": "An error occurred while processing your request"}), 500


@app.route("/activity_date_range_global/<jobid>", methods=["GET"])
def activity_date_range_global(jobid):
    sanitized_jobid = DBHandler.sanitize_table_name(jobid)
    table_name = f"result_{sanitized_jobid}"

    conn = DBHandler.get_db_connection()
    if conn is None:
        return jsonify({"error": "Could not connect to database"}), 500

    try:
        cur = conn.cursor()

        # Get all combinations of sourceactivity and destinationactivity
        query_pairs = sql.SQL(
            """
            SELECT DISTINCT
                sourceactivity,
                destinationactivity
            FROM {}
            ORDER BY sourceactivity, destinationactivity
        """
        ).format(sql.Identifier(table_name))

        cur.execute(query_pairs)
        pairs = cur.fetchall()

        # Get the earliest starttime and latest endtime from the entire table
        query_time_range = sql.SQL(
            """
            SELECT
                LEAST(MIN(starttime), MIN(endtime)) as earliest_time,
                GREATEST(MAX(starttime), MAX(endtime)) as latest_time
            FROM {}
        """
        ).format(sql.Identifier(table_name))

        cur.execute(query_time_range)
        time_range = cur.fetchone()

        # Convert the result to a list of dictionaries for pairs
        result_pairs = []
        for row in pairs:
            result_pairs.append({"source_activity": row[0], "destination_activity": row[1]})

        # Convert the time range to a dictionary
        result_time_range = {
            "earliest_time": time_range[0].strftime("%Y-%m-%d %H:%M:%S") if time_range[0] else None,
            "latest_time": time_range[1].strftime("%Y-%m-%d %H:%M:%S") if time_range[1] else None,
        }

        cur.close()
        conn.close()

        return jsonify({"activity_pairs": result_pairs, "time_range": result_time_range})

    except Exception as e:
        print("Error executing query:", e)
        return jsonify({"error": "An error occurred while processing your request"}), 500


@app.route("/activity_pairs/<jobid>", methods=["GET"])
def activity_pairs(jobid):
    sanitized_jobid = DBHandler.sanitize_table_name(jobid)
    table_name = f"result_{sanitized_jobid}"

    conn = DBHandler.get_db_connection()
    if conn is None:
        return jsonify({"error": "Could not connect to database"}), 500

    try:
        cur = conn.cursor()

        # Get all combinations of sourceactivity and destinationactivity
        query = sql.SQL(
            """
            SELECT DISTINCT
                sourceactivity,
                destinationactivity
            FROM {}
            ORDER BY sourceactivity, destinationactivity
        """
        ).format(sql.Identifier(table_name))

        cur.execute(query)
        rows = cur.fetchall()

        # Convert the result to a list of dictionaries
        result = []
        for row in rows:
            result.append({"source_activity": row[0], "destination_activity": row[1]})

        cur.close()
        conn.close()

        return jsonify(result)

    except Exception as e:
        print("Error executing query:", e)
        return jsonify({"error": "An error occurred while processing your request"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
