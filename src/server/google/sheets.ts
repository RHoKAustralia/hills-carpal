import { GoogleSpreadsheet } from 'google-spreadsheet';
import { CompletePayload } from '../../common/model';

type SurveyDetails = CompletePayload & {
  driverName: string;
  rideDateTime: string;
  clientName: string;
};

const writeSurvey = async (survey: SurveyDetails) => {
  const doc = new GoogleSpreadsheet(process.env.SURVEY_GOOGLE_SHEET_ID);
  const googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY;

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: googlePrivateKey,
  });
  await doc.loadInfo()
  const sheet = doc.sheetsByIndex[0];

  await sheet.addRow({
    DRIVER_NAME: survey.driverName,
    RIDE_DATE_TIME: survey.rideDateTime,
    CLIENT_NAME: survey.clientName,
    LATENESS: survey.lateness,
    SATISFACTION: survey.satisfaction,
    COMMUNICATIONS_ISSUES: survey.communicationsIssues,
    MOBILITY_PERMIT: survey.mobilityPermit,
    REIMBURSEMENT_AMOUNT: survey.reimbursementAmount,
    ANYTHING_ELSE: survey.anythingElse,
  });
};

export default writeSurvey;
