"""
Copyright 2017 Doxee S.p.A.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""
import json
import requests


def execute_query_to_uri(uri, index, doc_type, size=5, query=""):
    q = "&q={}".format(query) if query != "" else ""
    print('{}/{}/{}/_search?pretty&size={}{}'.format(uri, index, doc_type, size, q))
    resp = requests.get('{}/{}/{}/_search?pretty&size={}{}'.format(uri, index, doc_type, size, q))
    return resp


def genSchoolsPull(url):
    schools = {}
    res = json.loads(execute_query_to_uri(url, "ortocedu", "plantsDevice", size=1000).content)
    for h in res["hits"]["hits"]:
        if h["_source"]["locationName"] not in schools.keys():
            schools[h["_source"]["locationName"]] = {"sensors": []}
        plant = json.loads(execute_query_to_uri(url, "ortocedu", "plants", query='(_id:{})'.format(
            h["_source"]["systemId"].decode("utf-8"))).content)["hits"]["hits"][0]
        schools[h["_source"]["locationName"]]["sensors"].append(
            {"systemId": h["_source"]["systemId"].decode("utf-8"), "plantName": plant["_source"]["name"]})
    print(json.dumps(schools, indent=2))
    return schools


def lambda_handler(event, context):
    # TODO implement
    print(event)
    uri = "https://almacloud.homenet.org/elasticsearch/"
    return genSchoolsPull(uri)


if __name__ == "__main__":
    lambda_handler({"key1": "value1"}, {"context": {}})
