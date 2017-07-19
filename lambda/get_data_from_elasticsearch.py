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

import datetime
import json
import requests


def execute_query_to_uri(uri, index, doc_type, size=5, query=""):
    q = "&q={}".format(query) if query != "" else ""
    print('{}/{}/{}/_search?pretty&size={}{}'.format(uri, index, doc_type, size, q))
    resp = requests.get('{}/{}/{}/_search?pretty&size={}{}'.format(uri, index, doc_type, size, q))
    return resp


def convert_datetime_to_milliseconds(date_time):
    millis = int((date_time - datetime.datetime(1970, 1, 1)).total_seconds() * 1000)
    # print millis, len("{}".format(millis))
    return millis


def getplantsDataStat(uri, school, date_from=datetime.datetime.now(), date_to=datetime.datetime.now()):
    lower_limit_date = datetime.datetime.strptime('{} 00:00:00,01'.format(datetime.datetime.strftime(date_from, '%d.%m.%Y')), '%d.%m.%Y %H:%M:%S,%f')
    upper_limit_date = datetime.datetime.strptime('{} 23:59:59,99'.format(datetime.datetime.strftime(date_to, '%d.%m.%Y')), '%d.%m.%Y %H:%M:%S,%f')
    for i in school["systemId"]:
        print("--------------systemId {}--------------".format(i))
        resp = execute_query_to_uri(uri, "ortocedu", "plantsDataStat",
                             query='(systemId:{} AND data:["{}"+TO+"{}"])'.format(i, convert_datetime_to_milliseconds(
                                 lower_limit_date), convert_datetime_to_milliseconds(upper_limit_date)))
        print(resp)
        print(resp.content)
        print("--------------PLANTS--------------")
        resp = execute_query_to_uri(uri, "ortocedu", "plants", query='(_id:{})'.format(i))
        print(resp)
        print(resp.content)


def main():
    uri = "https://almacloud.homenet.org/elasticsearch/"
    schools = genSchoolsPull(uri)
    # print(json.dumps(schools["Scuola primaria Balletti-Mancasale"], indent=2))
    for k in schools.keys():
        print("--------------"+k+"--------------")
        getplantsDataStat(uri, schools[k])


# Collect systemIds and locationIds for each school
def genSchoolsPull(url):
    schools = {}
    res = json.loads(execute_query_to_uri(url, "ortocedu", "plantsDevice", size=1000).content)
    for h in res["hits"]["hits"]:
        if h["_source"]["locationName"] not in schools.keys():
            schools[h["_source"]["locationName"]] = {"locationId": [], "systemId": []}

        schools[h["_source"]["locationName"]]["locationId"].append(h["_source"]["locationId"])
        schools[h["_source"]["locationName"]]["systemId"].append(h["_source"]["systemId"].decode("utf-8"))
    print(json.dumps(schools, indent=2))
    return schools


if __name__ == "__main__":
    # convert_datetime_to_milliseconds(datetime.datetime.strptime('18.05.2017', '%d.%m.%Y'))
    main()