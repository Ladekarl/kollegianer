import {https} from 'firebase-functions';
import {database} from 'firebase-admin';

export const UpdateSheriffAndKitchenWeek = https.onRequest(async (req, res) => {
  const db = database();
  const updates: {[index: string]: any} = {};
  const newSheriff = req.query.sheriff;
  const newWeek = req.query.week;

  console.log("Params:", req.query);

  if (!newSheriff || !newWeek) {
    res.status(400).send('Missing parameters');
    return;
  }

  (await db.ref('/user').once('value')).forEach((data) => {
    const userObj = data.val();
    const uid = data.key ?? '';
    if (userObj?.kitchenweek) {
      updates[`${uid}/kitchenweek`] = false;
    }
    if (userObj?.sheriff) {
      updates[`${uid}/sheriff`] = false;
    }
    if (userObj?.room == newSheriff) updates[`${uid}/sheriff`] = true;

    if (userObj?.room == newWeek) updates[`${uid}/kitchenweek`] = true;
  });
  return db.ref("/user").update(updates).then(() => res.send('OK').end());
});
