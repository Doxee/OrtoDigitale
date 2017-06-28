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
import requests
import json
from datetime import datetime, timedelta
from calendar import monthrange


def execute_query_to_uri(uri, method, index, doc_type, query="", sort="", querystring=None, data=""):
    if querystring is None:
        querystring = {}
    if query != "":
        querystring["q"] = "{}".format(query)
    if sort != "":
        querystring["sort"] = "{}".format(sort)
    resp = requests.request(method, '{}/{}/{}/_search'.format(uri, index, doc_type), params=querystring, data=data)
    print resp.url
    return resp


def retrieve_every_entry_item_for_a_query(uri, index, doc_type, size=50, query=""):
    sort = "{}:{}".format("data", "asc")
    start_index = 0
    total = 1
    hits = []
    while start_index < total:
        resp = json.loads(execute_query_to_uri(uri, "GET", index, doc_type, query=query, sort=sort,
                                               querystring={"from": start_index, "pretty": "", "size": size}).content)
        if "hits" in resp:
            hits.extend(resp["hits"]["hits"])
            total = resp["hits"]["total"]
            start_index += size
        else:
            break
    return hits


def convert_datetime_to_milliseconds(date_time):
    millis = int((date_time - datetime(1970, 1, 1)).total_seconds() * 1000)
    return millis


def getMaxMinDimensions(uri, index, doc_type, query="", sort="", min_period="G"):
    resp_dict = {}
    querystring = {"from": "0", "pretty": ""}
    if query != "":
        querystring["q"] = "{}".format(query)
    if sort != "":
        querystring["sort"] = "{}".format(sort)
    payload = {
        "size": 1,
        "aggs": {
            "max_temp": {"max": {"field": "airTemperature"}},
            "avg_temp": {"avg": {"field": "airTemperature"}},
            "min_temp": {"min": {"field": "airTemperature"}},
            "max_moisture": {"max": {"field": "soilMoisture"}},
            "avg_moisture": {"avg": {"field": "soilMoisture"}},
            "min_moisture": {"min": {"field": "soilMoisture"}},
            "max_brightness": {"max": {"field": "sunlight"}},
            "avg_brightness": {"avg": {"field": "sunlight"}},
            "min_brightness": {"min": {"field": "sunlight"}}
        }
    }
    resp = json.loads(
        execute_query_to_uri(uri, "POST", index, doc_type, data=json.dumps(payload), querystring=querystring).content)
    if len(resp["hits"]["hits"]) > 0:
        if min_period == "G":
            resp_dict["date"] = datetime.fromtimestamp(int(resp["hits"]["hits"][0]["_source"]["data"]) / 1000).strftime(
                '%d.%m.%Y')
        elif min_period == "H":
            resp_dict["date"] = datetime.fromtimestamp(int(resp["hits"]["hits"][0]["_source"]["data"]) / 1000).strftime(
                '%d.%m.%Y %H')
        else:
            resp_dict["date"] = datetime.fromtimestamp(int(resp["hits"]["hits"][0]["_source"]["data"]) / 1000).strftime(
                '%m.%Y')
        resp_dict["temperature"] = {
            "min": int(resp["aggregations"]["min_temp"]["value"]),
            "avg": int(resp["aggregations"]["avg_temp"]["value"]),
            "max": int(resp["aggregations"]["max_temp"]["value"])
        }
        resp_dict["moisture"] = {
            "min": int(resp["aggregations"]["min_moisture"]["value"]),
            "avg": int(resp["aggregations"]["avg_moisture"]["value"]),
            "max": int(resp["aggregations"]["max_moisture"]["value"])
        }
        resp_dict["brightness"] = {
            "min": int(resp["aggregations"]["min_brightness"]["value"]),
            "avg": int(resp["aggregations"]["avg_brightness"]["value"]),
            "max": int(resp["aggregations"]["max_brightness"]["value"])
        }
    return resp_dict


def getPlantRange(uri, **kwargs):
    hits = retrieve_every_entry_item_for_a_query(uri, "ortocedu", "plants", query='(_id:{})'.format(kwargs["systemId"]))
    if len(hits) >= 1:
        return {
            "temperature": {
                "min": int(hits[0]["_source"]["alerts"]["airTemperature"]["lowTh"]),
                "max": int(hits[0]["_source"]["alerts"]["airTemperature"]["highTh"])
            },
            "moisture": {
                "min": int(hits[0]["_source"]["alerts"]["soilMoisture"]["lowTh"]),
                "max": int(hits[0]["_source"]["alerts"]["soilMoisture"]["highTh"])
            },
            "brightness": {
                "min": int(hits[0]["_source"]["alerts"]["sunlight"]["lowTh"]),
                "max": int(hits[0]["_source"]["alerts"]["sunlight"]["highTh"])
            }
        }
    else:
        return -1


def getMaxAvgMinBetweenDates(url, params):
    data = []
    date_from = datetime.strptime(params["date_from"], "%d.%m.%Y %H:%M")
    date_to = datetime.strptime(params["date_to"], "%d.%m.%Y %H:%M")
    while date_from < date_to:
        if "min_period" in params and params["min_period"] == "H":
            if (date_to - date_from).days > 1:
                return -1
            tmp_date = date_from + timedelta(hours=1)
            lower_limit_date = datetime.strptime('{}:00,01'.format(date_from.strftime("%d.%m.%Y %H:%M")),
                                                 '%d.%m.%Y %H:%M:%S,%f')
            upper_limit_date = tmp_date
            print lower_limit_date
            print upper_limit_date
        elif "min_period" in params and params["min_period"] == "M":
            tmp_date = datetime.strptime(
                '01.{}.{} 00:00:00'.format(date_from.month + 1 if date_from.month + 1 <= 12 else "01",
                                           date_from.year + 1 if date_from.month + 1 > 12 else date_from.year),
                '%d.%m.%Y %H:%M:%S')
            lower_limit_date = datetime.strptime('01.{}.{} 00:00:00,01'.format(date_from.month, date_from.year),
                                                 '%d.%m.%Y %H:%M:%S,%f')
            upper_limit_date = datetime.strptime(
                '{}.{}.{} 23:59:59,99'.format(monthrange(date_from.year, date_from.month)[1], date_from.month,
                                              date_from.year),
                '%d.%m.%Y %H:%M:%S,%f')
        else:
            if (date_to - date_from).days > 31:
                return -1
            params["min_period"] = "G"
            tmp_date = date_from + timedelta(days=1)
            lower_limit_date = datetime.strptime('{} 00:00:00,01'.format(date_from.strftime("%d.%m.%Y")),
                                                 '%d.%m.%Y %H:%M:%S,%f')
            upper_limit_date = datetime.strptime('{} 23:59:59,99'.format(date_from.strftime("%d.%m.%Y")),
                                                 '%d.%m.%Y %H:%M:%S,%f')
        q = '(systemId:{} AND data:[{} TO {}])'.format(params["systemId"],
                                                       convert_datetime_to_milliseconds(lower_limit_date),
                                                       convert_datetime_to_milliseconds(upper_limit_date))
        data.append(getMaxMinDimensions(url, "ortocedu", "plantsDataStat", query=q, min_period=params["min_period"]))
        date_from = tmp_date
    return data


def lambda_handler(event, context):
    print(event)
    get_uri = "https://almacloud.homenet.org/elasticsearch"
    post_url = "https://:@almacloud.homenet.org"

    if "query" in event and event["query"]:
        params = event["query"]
    elif "body" in event and event["body"]:
        params = event["body"]
    else:
        raise Exception('invalid missing parameters')

    resp = {
        "granularity": 0,
        "schoolName": params["school"] if "school" in params else "",
        "systemId": params["systemId"],
        "range": {},
        "data": []
    }

    res = getPlantRange(get_uri, **params)
    if res != -1:
        resp["range"] = res
    else:
        raise Exception('invalid data for school')

    if "date_from" not in params:
        params["date_from"] = '{} 00:00'.format(datetime.now().strftime("%d.%m.%Y"))
    if "date_to" not in params:
        params["date_to"] = datetime.now().strftime("%d.%m.%Y %H:%M")
    res = getMaxAvgMinBetweenDates(post_url, params)
    if res != -1:
        resp["data"].extend(res)
    else:
        raise Exception('invalid range for the request')
    return resp


if __name__ == "__main__":
    # print(lambda_handler(
    #     {"query": {"school": "Scuola dell\u2019infanzia Diana", "systemId": "a0143d7cbf20", "min_period": "H"}},
    #     {"context": {}}))
    print (lambda_handler({"query": {"school": "Scuola dell'infanzia Diana", "systemId": "a0143d7cbf20",
                                     "date_from": "21.05.2017 00:00", "date_to": "21.05.2017 23:59",
                                     "min_period": "G"}}, {"context": {}}))
    # print(lambda_handler({"query": {"school": "Scuola dell\u2019infanzia Diana", "systemId": "a0143d7cbf20",
    #                           "date_from": "20.05.2016 09:00", "min_period": "M"}}, {"context": {}}))
