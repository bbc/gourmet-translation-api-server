// Ports that language models will be available on via the load balancer
const portForEachLanguagePairModel = {
  bg: {
    en: 4001,
  },
  sw: {
    en: 4003,
  },
  gu: {
    en: 4005,
  },
  tr: {
    en: 4007,
  },
  sr: {
    en: 4009,
  },
  am: {
    en: 4011,
  },
  ky: {
    en: 4013,
  },
  ta: {
    en: 4015,
  },
  mk: {
    en: 4017,
  },
  ti: {
    en: 4019,
  },
  en: {
    bg: 4002,
    sw: 4004,
    gu: 4006,
    tr: 4008,
    sr: 4010,
    am: 4012,
    ky: 4014,
    ta: 4016,
    mk: 4018,
    ti: 4020,
  },
};

module.exports = portForEachLanguagePairModel;
