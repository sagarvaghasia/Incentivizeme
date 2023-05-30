import json
import boto3
import decimal
eventbridge = boto3.client('events')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return str(obj)
        return super(DecimalEncoder, self).default(obj)

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('projects')

def lambda_handler(event, context):
    requestJSON = json.loads(event['body'])
    project_id = requestJSON['id']
    headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST'
    }
    try:
        response = table.update_item(
            Key={
                'id': project_id
            },
            UpdateExpression='SET #s = :status',
            ExpressionAttributeNames={
                '#s': 'status'
            },
            ExpressionAttributeValues={
                ':status': 'approve'
            },
            ReturnValues="ALL_NEW"
        )
            
        attendance_table = dynamodb.Table('attendances')
        attendances = attendance_table.scan(
            FilterExpression='projectId.id = :id',
            ExpressionAttributeValues={
                ':id': project_id
            }
        )
        
        # Calculate the total amount earned by employees on this project
        total_earned = 0
        total_hours_worked = 0
        for attendance in attendances['Items']:
            total_earned += float(attendance['employeeId']['wage']) * float(attendance['hours'])
            total_hours_worked += float(attendance['hours'])
        
        # Query the project table for the project with the matching ID
        project_table = dynamodb.Table('projects')
        response = project_table.get_item(
            Key={
                'id': project_id
            }
        )
        # Calculate the remaining budget
        remaining_budget = float(response['Item']['budgetAmount']) - total_earned
        
        # Distribute the remaining budget to all attendances as per worked hours
        for attendance in attendances['Items']:
            hours_worked = float(attendance['hours'])
            Bonus = remaining_budget * (hours_worked / total_hours_worked)
            Bonus = decimal.Decimal(str(Bonus))
            attendance_table.update_item(
                Key={
                    'id': attendance['id']
                },
                UpdateExpression='SET Bonus = :Bonus',
                ExpressionAttributeValues={
                    ':Bonus': Bonus
                }
            )
        

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(response, cls=DecimalEncoder)
        }
    except dynamodb.meta.client.exceptions.ClientError as e:
        error_message = e.response['Error']['Message']
        return {
            'statusCode': 404,
            'body': json.dumps({'error': error_message})
        }
