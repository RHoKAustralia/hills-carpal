import { GoogleSpreadsheet } from 'google-spreadsheet';
import moment from 'moment';
import { CompletePayload } from '../../common/model';

type SurveyDetails = CompletePayload & {
  driverName: string;
  rideDateTime: moment.Moment;
  clientName: string;
};

const writeSurvey = async (survey: SurveyDetails) => {
  const doc = new GoogleSpreadsheet(process.env.SURVEY_GOOGLE_SHEET_ID);
  const googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: googlePrivateKey,
  });
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];

  await sheet.addRow({
    Timestamp: moment.tz(process.env.TIMEZONE).format('DD/MM/YYYY HH:mm:ss'),
    "Select your (Driver's) name:": survey.driverName,
    'Date of Ride': survey.rideDateTime.format('DD/MM/YYYY'),
    'Nominated pickup time (AM/PM)': survey.rideDateTime.format('HH:mm:ss'),
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

export default writeSurvey;
