# Simod Configuration Dev Notes

**Simod configuration form** is automatically generated from **JSON Schema** present in this folder.

The schema itself has been initially generated with the **Simod CLI** tool by running `simod --schema-json`. However, automatically generated schema is not ideal. So, it has been manually adjusted, which means that if there are some changes on the Simod's side, the JSON Schema from this folder has to be **manually adjusted** too.

The following resources might be helpful when working with the form and Simod configuration form:

- JSON Schema specification: [https://json-schema.org/understanding-json-schema](https://json-schema.org/understanding-json-schema)
- Generating *Form* from JSON Schema library: [https://rjsf-team.github.io/react-jsonschema-form/docs/advanced-customization/custom-templates](https://rjsf-team.github.io/react-jsonschema-form/docs/advanced-customization/custom-templates)

**NB:** Also, note that [sample configurations](https://github.com/AutomatedProcessImprovement/Simod/tree/master/resources/config) provided in the Simod repository, do not itself adhere to the generated JSON (or YAML) Schema because Simod CLI allows a [more flexible way](https://github.com/AutomatedProcessImprovement/Simod/blob/master/src/simod/settings/common_settings.py#L39) of specifying different parameters. For instance, the *three gram distance metric* can be specified as `n_gram`, `n_gram_distance`, `three_gram_distance`, and `3_gram_distance` while the JSON Schema only allows for `three_gram_distance`.
