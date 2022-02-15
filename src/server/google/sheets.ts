import { GoogleSpreadsheet } from 'google-spreadsheet';
import moment from 'moment-timezone';
import { CompletePayload, Ride } from '../../common/model';

const googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

type SurveyDetails = CompletePayload & {
  driverName: string;
  rideDateTime: moment.Moment;
  clientName: string;
};

const writeSurvey = async (survey: SurveyDetails) => {
  const doc = new GoogleSpreadsheet(process.env.SURVEY_GOOGLE_SHEET_ID);

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: googlePrivateKey,
  });
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];

  await sheet.addRow({
    Timestamp: moment.tz(process.env.TIMEZONE).format('DD/MM/YYYY HH:mm:ss'),
    "Select your (Driver's) name:": survey.driverName,
    'Date of Ride': survey.rideDateTime.tz(process.env.TIMEZONE).format('DD/MM/YYYY'),
    'Nominated pickup time (AM/PM)': survey.rideDateTime.tz(process.env.TIMEZONE).format('HH:mm:ss'),
    'Select the name of the client who was transported': survey.clientName,
    'Tell us about the pickup': survey.lateness,
    'Overall, how satisfied are you about the Ride?': survey.satisfaction,
    'Communications issues, if any': survey.communicationsIssues,
    "Was CarPal's Mobility Parking Scheme (MPS) Permit used on this Ride?":
      survey.mobilityPermitUsedDropOff ||
      survey.mobilityPermitUsedPickup ||
      survey.mobilityPermitUsedOtherAddress
        ? 'YES'
        : 'NO',
    'If the MPS Permit was used, was it used on pickup?':
      survey.mobilityPermitUsedPickup ? 'YES' : 'NO',
    'If the MPS Permit was used, was it used on drop-off?':
      survey.mobilityPermitUsedDropOff ? 'YES' : 'NO',
    'If the MPS was used at a "stop" on the Ride, please tell us the street address or location:':
      survey.mobilityPermitUsedOtherAddress || '',
    'Reimbursement amount you are claiming': survey.reimbursementAmount,
    'Anything else about the Ride goes here': survey.anythingElse,
  });
};

/** Dumps the rides provided into the ride backup spreadsheet, erasing its current contents */
export const dumpBackupRides = async (rides: Ride[]) => {
  const doc = new GoogleSpreadsheet(process.env.BACKUP_GOOGLE_SHEET_ID);

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: googlePrivateKey,
  });
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];

  await sheet.clear();
  await sheet.setHeaderRow([
    'CLIENT_NAME',
    'LOCATION_FROM',
    'LOCATION_TO',
    'STATUS',
    'DRIVER_NAME',
    'RIDE_DATE',
    'DESCRIPTION',
    'FACILITATOR',
    'CREATED_DATE',
  ]);

  const rows = rides.map((ride) => ({
    CLIENT_NAME: ride.client?.name,
    LOCATION_FROM: ride.locationFrom.placeName,
    LOCATION_TO: ride.locationTo.placeName,
    STATUS: ride.status,
    DRIVER_NAME: ride.driver?.name,
    RIDE_DATE: moment
      .tz(ride.pickupTimeAndDate, process.env.TIMEZONE)
      .toISOString(),
    DESCRIPTION: ride.description,
    FACILITATOR: ride.facilitatorEmail,
    CREATED_DATE: moment
      .tz(ride.rideCreatedTimeAndDate, process.env.TIMEZONE)
      .toISOString(),
  }));

  await sheet.addRows(rows);
};

export default writeSurvey;
