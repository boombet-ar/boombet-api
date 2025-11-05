//Aca se importan y se crean las listas con los casinos

//CABA 
const bplayCaba = require('../scripts/caba/bplayCaba');

//PBA
const sportsbetPba = require('../scripts/pba/sportsbetPba');
const bplayPba = require('../scripts/pba/bplayPba')

//CBA
const bplayCba = require('../scripts/cba/bplayCba')

//SFE
const bplaySfe = require('../scripts/sfe/bplaySfe')

const scriptsList = {
  caba: [bplayCaba],
  pba:[sportsbetPba, bplayPba],
  cba:[bplayCba],
  sfe:[bplaySfe]
};

module.exports=scriptsList