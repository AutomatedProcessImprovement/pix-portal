import { useEffect, useState } from "react";
import YAML from "yaml";
import type { Asset } from "~/services/assets";
import type { User } from "~/services/auth";
import { getFileContent } from "~/services/files";

export function useSimodConfigurationFromAsset({ asset, user }: { asset: Asset | null; user: User | null }) {
  const [simodConfiguration, setSimodConfiguration] = useState<any | null>(null);
  useEffect(() => {
    if (!asset || asset.files_ids.length === 0 || !user || !user.token) return;
    const fileId = asset.files_ids[0];
    getFileContent(fileId, user.token)
      .then((content) => {
        const reader = new FileReader();
        reader.onload = function () {
          const text = reader.result;
          const simodConfiguration = YAML.parse(text as string);
          setSimodConfiguration(simodConfiguration);
        };
        reader.readAsText(content);
      })
      .catch((error) => {
        console.error("Error while fetching simod configuration file content", error);
      });
  }, [asset, user]);
  return simodConfiguration;
}
