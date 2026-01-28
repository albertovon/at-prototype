(() => {
  const SCENARIOS = {
    AIRLINE_ARRANGED: "airline_arranged",
    SELF_BOOKED_NO_OFFER: "self_booked_no_offer",
    SELF_BOOKED_SAME_DAY: "self_booked_same_day_offer",
    SELF_BOOKED_NEXT_DAY: "self_booked_next_day_offer",
    SELF_BOOKED_TWO_PLUS_DAYS: "self_booked_two_plus_days_offer",
    SELF_BOOKED_UNKNOWN_OFFER: "self_booked_unknown_offer",
    ABANDONED: "journey_abandoned",
  };

  const Q1 = {
    AIRLINE: "airline",
    SELF: "self",
    ABANDONED: "abandoned",
  };

  const Q2 = {
    YES: "yes",
    NO: "no",
  };

  const Q3 = {
    SAME_DAY: "same_day",
    NEXT_DAY: "next_day",
    TWO_PLUS_DAYS: "two_plus_days",
    UNKNOWN: "unknown",
  };

  const DISRUPTION = {
    DAYTIME: "daytime",
    OVERNIGHT: "overnight",
  };

  const baseOutcome = {
    arrivedAtFinalDestination: true,
    alternativeTransportProvidedBy: "passenger",
    ticketRefund: false,
    ticketRefundPlus: true,
  };

  function buildOutcome(overrides) {
    return {
      ...baseOutcome,
      reasonableMeasuresFulfilled: true,
      scenario: "",
      ...overrides,
    };
  }

  function evaluateDecision({ q1, q2, q3, disruptionTiming }) {
    if (!Object.values(Q1).includes(q1)) {
      throw new Error("q1 must be one of: airline, self, abandoned");
    }

    if (q1 === Q1.AIRLINE) {
      return buildOutcome({
        scenario: SCENARIOS.AIRLINE_ARRANGED,
        alternativeTransportProvidedBy: "airline",
        ticketRefundPlus: false,
        reasonableMeasuresFulfilled: null,
      });
    }

    if (q1 === Q1.ABANDONED) {
      return buildOutcome({
        scenario: SCENARIOS.ABANDONED,
        arrivedAtFinalDestination: false,
        alternativeTransportProvidedBy: "none",
        ticketRefund: true,
        ticketRefundPlus: false,
      });
    }

    if (q2 === Q2.NO) {
      return buildOutcome({
        scenario: SCENARIOS.SELF_BOOKED_NO_OFFER,
        reasonableMeasuresFulfilled: false,
      });
    }

    if (q2 !== Q2.YES) {
      throw new Error("q2 must be provided for self-booked journeys (yes/no)");
    }

    if (!Object.values(Q3).includes(q3)) {
      throw new Error(
        "q3 must be one of: same_day, next_day, two_plus_days, unknown",
      );
    }

    if (q3 === Q3.SAME_DAY) {
      return buildOutcome({
        scenario: SCENARIOS.SELF_BOOKED_SAME_DAY,
      });
    }

    if (q3 === Q3.NEXT_DAY) {
      if (!Object.values(DISRUPTION).includes(disruptionTiming)) {
        throw new Error("disruptionTiming must be daytime or overnight");
      }

      return buildOutcome({
        scenario: SCENARIOS.SELF_BOOKED_NEXT_DAY,
        reasonableMeasuresFulfilled: disruptionTiming === DISRUPTION.OVERNIGHT,
      });
    }

    if (q3 === Q3.TWO_PLUS_DAYS) {
      return buildOutcome({
        scenario: SCENARIOS.SELF_BOOKED_TWO_PLUS_DAYS,
        reasonableMeasuresFulfilled: false,
      });
    }

    return buildOutcome({
      scenario: SCENARIOS.SELF_BOOKED_UNKNOWN_OFFER,
    });
  }

  function parseArgs(argv) {
    return argv.reduce((acc, arg) => {
      const [key, value] = arg.replace(/^--/, "").split("=");
      if (!key || value === undefined) return acc;
      acc[key] = value;
      return acc;
    }, {});
  }

  if (typeof module !== "undefined" && module.exports) {
    if (require.main === module) {
      try {
        const args = parseArgs(process.argv.slice(2));
        const result = evaluateDecision({
          q1: args.q1,
          q2: args.q2,
          q3: args.q3,
          disruptionTiming: args.disruptionTiming,
        });
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
    }

    module.exports = {
      DISRUPTION,
      Q1,
      Q2,
      Q3,
      SCENARIOS,
      evaluateDecision,
    };
  } else {
    const globalScope = typeof window !== "undefined" ? window : globalThis;
    globalScope.DecisionModel = {
      DISRUPTION,
      Q1,
      Q2,
      Q3,
      SCENARIOS,
      evaluateDecision,
    };
  }
})();
