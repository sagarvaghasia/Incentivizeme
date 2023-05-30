import json
import boto3
import decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)
        
dynamo = boto3.resource('dynamodb').Table('projects')

def lambda_handler(event, context):
    body = ''
    statusCode = 200
    headers = {
        "Content-Type": "application/json",
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    }
    
    try:
        print("event data: " + json.dumps(event))
        
        route = event['httpMethod'] + " " + event['resource']
        
        if route.startswith("DELETE /projects/"):
            id = event['pathParameters']['id']
            dynamo.delete_item(Key={'id': id})
            body = f"Deleted item {id}"
        
        elif route.startswith("GET /projects/"):
            id = event['pathParameters']['id']
            response = dynamo.get_item(Key={'id': id})
            body = response['Item']
            
        elif route == "GET /projects":
            response = dynamo.scan()
            body = response['Items']
            
        elif route == "PUT /projects":
            requestJSON = json.loads(event['body'])
            
            dynamo.put_item(Item={
                'id': requestJSON['id'],
                'name': requestJSON['name'],
                'status':requestJSON['status'],
                'managerId':requestJSON.get('managerId',{}),
                'budgetAmount':requestJSON['budgetAmount'],
            })
            body = requestJSON
        else:
            raise Exception(f"Unsupported route: \"{route} - EVENT: {json.dumps(event)}\"")
    
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