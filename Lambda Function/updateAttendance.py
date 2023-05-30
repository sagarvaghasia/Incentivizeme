import json
import boto3
import decimal

dynamo = boto3.resource('dynamodb').Table('attendances')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)
        
def lambda_handler(event, context):
    statusCode = 200
    body = ''
    headers = {
        "Content-Type": "application/json",
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    }
    try:
        print("event data: " + json.dumps(event))
        requestJSON = json.loads(event['body'])
        hours_decimal = decimal.Decimal(str(requestJSON['hours']))

        dynamo.put_item(Item={
            'id': requestJSON['id'],
            'employeeId': requestJSON['employeeId'],
            'projectId': requestJSON['projectId'],
            'startDate': requestJSON['startDate'],
            'endDate': requestJSON['endDate'],
            'hours': hours_decimal
        })
        body = {
            'id': requestJSON['id'],
            'employeeId': requestJSON['employeeId'],
            'projectId': requestJSON['projectId'],
            'startDate': requestJSON['startDate'],
            'endDate': requestJSON['endDate'],
            'hours': hours_decimal
        }
    except Exception as e:
        statusCode = 400
        body = str(e)
    finally:
        body = json.dumps(body,cls=DecimalEncoder)
    
    return {
        'statusCode': statusCode,
        'body': body,
        'headers': headers
    }