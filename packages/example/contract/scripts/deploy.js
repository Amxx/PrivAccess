const { MigrationManager, getFactory } = require('@amxx/hre/scripts');

(async () => {
    const manager  = new MigrationManager(ethers.provider);
    const deployed = await getFactory("Registration").then(factory => manager.migrate('registration', factory));
    console.log(deployed.address);

})().catch(console.error);
