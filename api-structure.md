This is used both for drivers and facilitator
POST `/login`
BODY {username: string, password: string}
Response:
Header status: 200,
BODY role: 'facilitator' | 'driver' | 'admin'

GET `/rides`
We could send user object or backend reads it from cookie?
Response:
If user facilitator:
BODY:
{
id: string,
client: string,
datetime: datetime,
locationFrom: Array<LatLng>,
locationTo: Array<LatLng>,
fbLink: string,
driverGender: string,
carType: string,
status: string,
}

If user is a driver:
This body should only contain results with the correct gender, car type and status.
BODY: {
datetime: datetime,
locationFrom: Array<LatLng>,
locationTo: Array<LatLng>,
fbLink: string,
id: string
}
Query params:
date
locationFrom
locationTo

POST `/rides`
Request:
BODY {
client: string,
datetime: datetime,
locationFrom: Array<LatLng>,
locationTo: Array<LatLng>,
fbLink: string,
driverGender: string,
carType: string,
status: string,
}
Reposnse status 200 and the created object

PUT `/rides`
We could send user object or backend reads it from cookie?
Request
BODY Fields you want to change
Response: the updated ride.
