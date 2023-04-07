import * as functions from 'firebase-functions';

const region = 'europe';

export const handleRatingWrite = functions
  .region(region)
  .firestore.document(`/shuttles/{shuttleId}/ratings/{ratingId}`)
  .onWrite(async (snap, context) => {
    // TODO: update aggregated rating
  });
