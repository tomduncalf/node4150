const Realm = require("realm");

class Task extends Realm.Object {
  static generate(description) {
    return {
      _id: new Realm.BSON.ObjectId(),
      partition: "",
      description,
      isComplete: false,
      createdAt: new Date(),
    };
  }

  // To use a class as a Realm object type, define the object schema on the static property "schema".
  static schema = {
    name: "Task",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      partition: "string",
      description: "string",
      isComplete: { type: "bool", default: false },
      createdAt: "date",
    },
  };
}

const go = async () => {
  const app = new Realm.App({ id: "application-0-qfcfo" });
  Realm.App.Sync.setLogLevel(app, "all");

  const credentials = Realm.Credentials.anonymous();
  const user = await app.logIn(credentials);

  const syncedRealm = await Realm.open({
    schema: [Task],
    path: "main-sync",
    sync: {
      user,
      partitionValue: "",
      newRealmFileBehavior: { type: "downloadBeforeOpen" },
      existingRealmFileBehavior: { type: "openImmediately" },
      error: (error) => {
        console.error("new realm error: ", error);
      },
    },
  });
  // setInterval(() => {
  syncedRealm.write(() => {
    syncedRealm.create(Task, Task.generate("test"));
  });
  // }, 100);
  const syncedTasks = syncedRealm.objects(Task);
  console.log("*** Synced", JSON.stringify(syncedTasks.toJSON(), null, 2));
};

go();
