export const BBS_ITEMS = [
  "Sitting to standing",
  "Standing unsupported",
  "Sitting with back unsupported but feet supported on floor or on a stool",
  "Standing to sitting",
  "Transfers",
  "Standing unsupported with eyes closed",
  "Standing unsupported with feet together",
  "Reaching forward with outstretched arm while standing",
  "Pick up object from the floor from a standing position",
  "Turning to look behind over left and right shoulders while standing",
  "Turn 360 degrees",
  "Placing alternate foot on step or stool while standing unsupported",
  "Standing unsupported one foot in front",
  "Standing on one leg"
];

export const FGA_ITEMS = [
  "Gait level surface",
  "Change in gait speed",
  "Gait with horizontal head turns",
  "Gait with vertical head turns",
  "Gait and pivot turn",
  "Step over obstacle",
  "Gait with narrow base of support",
  "Gait with eyes closed",
  "Ambulating backwards",
  "Steps"
];

export const PATIENT_POPULATIONS = [
  "General",
  "Stroke",
  "Spinal Cord Injury (SCI)",
  "Traumatic Brain Injury (TBI)",
  "Parkinson's Disease",
  "Multiple Sclerosis",
  "Vestibular Disorder",
  "Other"
];

export const SETTINGS = ["Inpatient", "Outpatient"];

// BBS Item Details with Instructions and Score Descriptions
export const BBS_ITEM_DETAILS = {
  1: {
    name: "Sitting to Standing",
    instruction: "Please stand up. Try not to use your hands for support.",
    scores: {
      4: {
        label: "Normal Performance",
        description: "Able to stand without using hands and stabilizes independently"
      },
      3: {
        label: "Mild Impairment",
        description: "Able to stand independently using hands"
      },
      2: {
        label: "Moderate Impairment",
        description: "Able to stand using hands after several tries"
      },
      1: {
        label: "Significant Impairment",
        description: "Needs minimal aid to stand or to stabilize"
      },
      0: {
        label: "Unable to Perform",
        description: "Needs moderate or maximal assist to stand"
      }
    }
  },
  2: {
    name: "Standing Unsupported",
    instruction: "Please stand for two minutes without holding on to anything.",
    scores: {
      4: {
        label: "Normal Performance",
        description: "Able to stand safely for 2 minutes"
      },
      3: {
        label: "Mild Impairment",
        description: "Able to stand 2 minutes with supervision"
      },
      2: {
        label: "Moderate Impairment",
        description: "Able to stand 30 seconds unsupported"
      },
      1: {
        label: "Significant Impairment",
        description: "Needs several tries to stand 30 seconds unsupported"
      },
      0: {
        label: "Unable to Perform",
        description: "Unable to stand 30 seconds unsupported"
      }
    }
  },
  3: {
    name: "Sitting Unsupported with Feet on Floor",
    instruction: "Please sit with your arms folded for 2 minutes.",
    scores: {
      4: {
        label: "Normal Performance",
        description: "Able to sit safely and securely for 2 minutes"
      },
      3: {
        label: "Mild Impairment",
        description: "Able to sit 2 minutes under supervision"
      },
      2: {
        label: "Moderate Impairment",
        description: "Able to sit 30 seconds"
      },
      1: {
        label: "Significant Impairment",
        description: "Able to sit 10 seconds"
      },
      0: {
        label: "Unable to Perform",
        description: "Unable to sit without support for 10 seconds"
      }
    }
  },
  4: {
    name: "Standing to Sitting",
    instruction: "Please sit down.",
    scores: {
      4: {
        label: "Normal Performance",
        description: "Sits safely with minimal use of hands"
      },
      3: {
        label: "Mild Impairment",
        description: "Controls descent by using hands"
      },
      2: {
        label: "Moderate Impairment",
        description: "Uses back of legs against chair to control descent"
      },
      1: {
        label: "Significant Impairment",
        description: "Sits independently but has uncontrolled descent"
      },
      0: {
        label: "Unable to Perform",
        description: "Needs assistance to sit"
      }
    }
  },
  5: {
    name: "Transfers",
    instruction: "Transfer from this chair with armrests to a chair without armrests (or bed). Use a pivot transfer.",
    scores: {
      4: {
        label: "Normal Performance",
        description: "Able to transfer safely with minor use of hands"
      },
      3: {
        label: "Mild Impairment",
        description: "Able to transfer safely, definite need of hands"
      },
      2: {
        label: "Moderate Impairment",
        description: "Able to transfer with verbal cueing and/or supervision"
      },
      1: {
        label: "Significant Impairment",
        description: "Needs one person to assist"
      },
      0: {
        label: "Unable to Perform",
        description: "Needs two people to assist or supervise to be safe"
      }
    }
  },
  6: {
    name: "Standing Unsupported with Eyes Closed",
    instruction: "Please close your eyes and stand still for 10 seconds.",
    scores: {
      4: {
        label: "Normal Performance",
        description: "Able to stand 10 seconds safely"
      },
      3: {
        label: "Mild Impairment",
        description: "Able to stand 10 seconds with supervision"
      },
      2: {
        label: "Moderate Impairment",
        description: "Able to stand 3 seconds"
      },
      1: {
        label: "Significant Impairment",
        description: "Unable to keep eyes closed 3 seconds but stays steady"
      },
      0: {
        label: "Unable to Perform",
        description: "Needs help to keep from falling"
      }
    }
  },
  7: {
    name: "Standing Unsupported with Feet Together",
    instruction: "Place your feet together and stand without holding on.",
    scores: {
      4: {
        label: "Normal Performance",
        description: "Able to place feet together independently and stand 1 minute safely"
      },
      3: {
        label: "Mild Impairment",
        description: "Able to place feet together independently and stand for 1 minute with supervision"
      },
      2: {
        label: "Moderate Impairment",
        description: "Able to place feet together independently but unable to hold for 30 seconds"
      },
      1: {
        label: "Significant Impairment",
        description: "Needs help to attain position but able to stand 15 seconds with feet together"
      },
      0: {
        label: "Unable to Perform",
        description: "Needs help to attain position and unable to hold for 15 seconds"
      }
    }
  },
  8: {
    name: "Reaching Forward with Outstretched Arm",
    instruction: "Lift your arm to 90 degrees. Stretch out your fingers and reach forward as far as you can.",
    scores: {
      4: {
        label: "Normal Performance",
        description: "Can reach forward confidently 25 cm (10 inches)"
      },
      3: {
        label: "Mild Impairment",
        description: "Can reach forward 12 cm (5 inches)"
      },
      2: {
        label: "Moderate Impairment",
        description: "Can reach forward 5 cm (2 inches)"
      },
      1: {
        label: "Significant Impairment",
        description: "Reaches forward but needs supervision"
      },
      0: {
        label: "Unable to Perform",
        description: "Loses balance while trying or requires external support"
      }
    }
  },
  9: {
    name: "Pick Up Object from Floor",
    instruction: "Pick up the shoe/slipper which is placed in front of your feet.",
    scores: {
      4: {
        label: "Normal Performance",
        description: "Able to pick up slipper safely and easily"
      },
      3: {
        label: "Mild Impairment",
        description: "Able to pick up slipper but needs supervision"
      },
      2: {
        label: "Moderate Impairment",
        description: "Unable to pick up but reaches 2-5 cm from slipper and keeps balance independently"
      },
      1: {
        label: "Significant Impairment",
        description: "Unable to pick up and needs supervision while trying"
      },
      0: {
        label: "Unable to Perform",
        description: "Unable to try or needs assist to keep from losing balance or falling"
      }
    }
  },
  10: {
    name: "Turning to Look Behind Over Shoulders",
    instruction: "Turn to look directly behind you over your left shoulder. Repeat to the right.",
    scores: {
      4: {
        label: "Normal Performance",
        description: "Looks behind from both sides and weight shifts well"
      },
      3: {
        label: "Mild Impairment",
        description: "Looks behind one side only, other side shows less weight shift"
      },
      2: {
        label: "Moderate Impairment",
        description: "Turns sideways only but maintains balance"
      },
      1: {
        label: "Significant Impairment",
        description: "Needs supervision when turning"
      },
      0: {
        label: "Unable to Perform",
        description: "Needs assistance to keep from losing balance or falling"
      }
    }
  },
  11: {
    name: "Turn 360 Degrees",
    instruction: "Turn completely around in a full circle. Pause. Then turn a full circle in the other direction.",
    scores: {
      4: {
        label: "Normal Performance",
        description: "Able to turn 360 degrees safely in 4 seconds or less"
      },
      3: {
        label: "Mild Impairment",
        description: "Able to turn 360 degrees safely one side only in 4 seconds or less"
      },
      2: {
        label: "Moderate Impairment",
        description: "Able to turn 360 degrees safely but slowly"
      },
      1: {
        label: "Significant Impairment",
        description: "Needs close supervision or verbal cueing"
      },
      0: {
        label: "Unable to Perform",
        description: "Needs assistance while turning"
      }
    }
  },
  12: {
    name: "Placing Alternate Foot on Step",
    instruction: "Place each foot alternately on the step/stool. Continue until each foot has touched the step 4 times (8 steps total).",
    scores: {
      4: {
        label: "Normal Performance",
        description: "Able to stand independently and safely and complete 8 steps in 20 seconds"
      },
      3: {
        label: "Mild Impairment",
        description: "Able to stand independently and complete 8 steps in more than 20 seconds"
      },
      2: {
        label: "Moderate Impairment",
        description: "Able to complete 4 steps without aid with supervision"
      },
      1: {
        label: "Significant Impairment",
        description: "Able to complete more than 2 steps, needs minimal assist"
      },
      0: {
        label: "Unable to Perform",
        description: "Needs assistance to keep from falling or unable to try"
      }
    }
  },
  13: {
    name: "Standing Unsupported One Foot in Front (Tandem Stance)",
    instruction: "Place one foot directly in front of the other. Try to step far enough ahead so the heel of your forward foot is ahead of the toes of your other foot.",
    scores: {
      4: {
        label: "Normal Performance",
        description: "Able to place foot in tandem independently and hold 30 seconds"
      },
      3: {
        label: "Mild Impairment",
        description: "Able to place foot ahead of other independently and hold 30 seconds"
      },
      2: {
        label: "Moderate Impairment",
        description: "Able to take small step independently and hold 30 seconds"
      },
      1: {
        label: "Significant Impairment",
        description: "Needs help to step but can hold 15 seconds"
      },
      0: {
        label: "Unable to Perform",
        description: "Loses balance while stepping or standing"
      }
    }
  },
  14: {
    name: "Standing on One Leg",
    instruction: "Stand on one leg as long as you can without holding on.",
    scores: {
      4: {
        label: "Normal Performance",
        description: "Able to lift leg independently and hold more than 10 seconds"
      },
      3: {
        label: "Mild Impairment",
        description: "Able to lift leg independently and hold 5 to 10 seconds"
      },
      2: {
        label: "Moderate Impairment",
        description: "Able to lift leg independently and hold 3 seconds or more"
      },
      1: {
        label: "Significant Impairment",
        description: "Tries to lift leg, unable to hold 3 seconds but remains standing independently"
      },
      0: {
        label: "Unable to Perform",
        description: "Unable to try or needs assist to prevent fall"
      }
    }
  }
};

// FGA Item Details with Instructions and Score Descriptions
export const FGA_ITEM_DETAILS = {
  1: {
    name: "Gait on Level Surface",
    instruction: "Walk at your normal speed from here to the next mark (20 feet or 6 meters).",
    scores: {
      3: {
        label: "Normal",
        description: "Walks 20 feet in less than 5.5 seconds, no assistive devices, good speed, no evidence of imbalance, normal gait pattern, deviates no more than 6 inches outside of the 12-inch walkway width"
      },
      2: {
        label: "Mild Impairment",
        description: "Walks 20 feet in 5.5 to 7 seconds, uses assistive device, slower speed, mild gait deviations, or deviates 6-10 inches outside of the 12-inch walkway width"
      },
      1: {
        label: "Moderate Impairment",
        description: "Walks 20 feet, slow speed (more than 7 seconds), abnormal gait pattern, evidence for imbalance, or deviates 10-15 inches outside 12-inch walkway width"
      },
      0: {
        label: "Severe Impairment",
        description: "Cannot walk 20 feet without assistance, severe gait deviations or imbalance, deviates greater than 15 inches outside 12-inch walkway width or reaches and touches wall"
      }
    }
  },
  2: {
    name: "Change in Gait Speed",
    instruction: "Begin walking at your normal pace. When I tell you 'go,' walk as fast as you can. When I say 'slow,' walk as slowly as you can.",
    scores: {
      3: {
        label: "Normal",
        description: "Smoothly changes walking speed without loss of balance or gait deviation. Shows a significant difference in walking speeds between normal, fast and slow speeds. Deviates no more than 6 inches outside 12-inch walkway width"
      },
      2: {
        label: "Mild Impairment",
        description: "Is able to change speed but demonstrates mild gait deviations, or no gait deviations but unable to achieve a significant change in velocity, or uses an assistive device. Deviates 6-10 inches outside 12-inch walkway width"
      },
      1: {
        label: "Moderate Impairment",
        description: "Makes only minor adjustments to walking speed, or accomplishes a change in speed with significant gait deviations, or changes speed but has loss of balance but is able to recover and continue walking. Deviates 10-15 inches outside 12-inch walkway width"
      },
      0: {
        label: "Severe Impairment",
        description: "Cannot change speeds, or loses balance and has to reach for wall or be caught. Deviates greater than 15 inches outside 12-inch walkway width"
      }
    }
  },
  3: {
    name: "Gait with Horizontal Head Turns",
    instruction: "Begin walking at your normal pace. When I tell you to 'look right,' keep walking straight, but turn your head to the right. Keep looking to the right until I tell you, 'look left,' then keep walking straight and turn your head to the left. Keep your head to the left until I tell you 'look straight,' then keep walking and return your head to center.",
    scores: {
      3: {
        label: "Normal",
        description: "Performs head turns smoothly with no change in gait. Deviates no more than 6 inches outside 12-inch walkway width"
      },
      2: {
        label: "Mild Impairment",
        description: "Performs head turns smoothly with slight change in gait velocity (e.g., minor disruption to smooth gait path), or uses walking aid. Deviates 6-10 inches outside 12-inch walkway width"
      },
      1: {
        label: "Moderate Impairment",
        description: "Performs head turns with moderate change in gait velocity, slows down, staggers but recovers, can continue to walk. Deviates 10-15 inches outside 12-inch walkway width"
      },
      0: {
        label: "Severe Impairment",
        description: "Performs task with severe disruption of gait (e.g., staggers outside 15 inch walkway width, loses balance, stops, reaches for wall)"
      }
    }
  },
  4: {
    name: "Gait with Vertical Head Turns",
    instruction: "Begin walking at your normal pace. When I tell you to 'look up,' keep walking straight, but tip your head up. Keep looking up until I tell you, 'look down,' then keep walking straight and tip your head down. Keep your head down until I tell you 'look straight,' then keep walking and return your head to the center.",
    scores: {
      3: {
        label: "Normal",
        description: "Performs head turns with no change in gait. Deviates no more than 6 inches outside 12-inch walkway width"
      },
      2: {
        label: "Mild Impairment",
        description: "Performs task with slight change in gait velocity (e.g., minor disruption to smooth gait path), or uses walking aid. Deviates 6-10 inches outside 12-inch walkway width"
      },
      1: {
        label: "Moderate Impairment",
        description: "Performs task with moderate change in gait velocity, slows down, staggers but recovers, can continue to walk. Deviates 10-15 inches outside 12-inch walkway width"
      },
      0: {
        label: "Severe Impairment",
        description: "Performs task with severe disruption of gait (e.g., staggers outside 15-inch walkway width, loses balance, stops, reaches for wall)"
      }
    }
  },
  5: {
    name: "Gait and Pivot Turn",
    instruction: "Begin walking at your normal pace. When I tell you, 'turn and stop,' turn as quickly as you can to face the opposite direction and stop.",
    scores: {
      3: {
        label: "Normal",
        description: "Pivot turns safely within 3 seconds and stops quickly with no loss of balance"
      },
      2: {
        label: "Mild Impairment",
        description: "Pivot turns safely in more than 3 seconds and stops with no loss of balance. OR pivots turns safely within 3 seconds and stops with mild imbalance, requires small steps to catch balance"
      },
      1: {
        label: "Moderate Impairment",
        description: "Turns slowly, requires verbal cueing, or requires several small steps to catch balance following turn and stop"
      },
      0: {
        label: "Severe Impairment",
        description: "Cannot turn safely, requires assistance to turn and stop"
      }
    }
  },
  6: {
    name: "Step Over Obstacle",
    instruction: "Begin walking at your normal speed. When you come to the shoe box, step over it, not around it, and keep walking.",
    scores: {
      3: {
        label: "Normal",
        description: "Able to step over two stacked shoe boxes (9 inches total height) without changing gait speed; no evidence of imbalance"
      },
      2: {
        label: "Mild Impairment",
        description: "Able to step over one shoe box (4.5 inches) without changing gait speed; no evidence of imbalance"
      },
      1: {
        label: "Moderate Impairment",
        description: "Able to step over one shoe box but must slow down and adjust steps to clear box safely. May require verbal cueing"
      },
      0: {
        label: "Severe Impairment",
        description: "Cannot perform without assistance"
      }
    }
  },
  7: {
    name: "Gait with Narrow Base of Support",
    instruction: "Walk on the floor with arms folded across the chest, feet aligned heel to toe (tandem walking) for a distance of 12 feet. The number of steps taken in a straight line are counted for a maximum of 10 steps.",
    scores: {
      3: {
        label: "Normal",
        description: "Able to ambulate for 10 steps heel to toe with no staggering"
      },
      2: {
        label: "Mild Impairment",
        description: "Ambulates 7 to 9 steps"
      },
      1: {
        label: "Moderate Impairment",
        description: "Ambulates 4 to 7 steps"
      },
      0: {
        label: "Severe Impairment",
        description: "Ambulates less than 4 steps heel to toe or cannot perform without assistance"
      }
    }
  },
  8: {
    name: "Gait with Eyes Closed",
    instruction: "Walk at your normal speed from here to the next mark (20 feet) with your eyes closed.",
    scores: {
      3: {
        label: "Normal",
        description: "Walks 20 feet, no assistive devices, good speed, no evidence of imbalance, normal gait pattern, deviates no more than 6 inches outside 12-inch walkway width. Ambulates 20 feet in less than 7 seconds"
      },
      2: {
        label: "Mild Impairment",
        description: "Walks 20 feet, uses assistive device, slower speed, mild gait deviations, or deviates 6-10 inches outside 12-inch walkway width. Ambulates 20 feet in 7 to 9 seconds"
      },
      1: {
        label: "Moderate Impairment",
        description: "Walks 20 feet, slow speed, abnormal gait pattern, evidence for imbalance, or deviates 10-15 inches outside 12-inch walkway width. Requires greater than 9 seconds to ambulate 20 feet"
      },
      0: {
        label: "Severe Impairment",
        description: "Cannot walk 20 feet without assistance, severe gait deviations or imbalance, deviates greater than 15 inches outside 12-inch walkway width, or will not attempt task"
      }
    }
  },
  9: {
    name: "Ambulating Backwards",
    instruction: "Walk backwards until I tell you to stop. (Examiner should remain close to patient.)",
    scores: {
      3: {
        label: "Normal",
        description: "Walks 20 feet, no assistive devices, good speed, no evidence of imbalance, normal gait pattern, deviates no more than 6 inches outside 12-inch walkway width"
      },
      2: {
        label: "Mild Impairment",
        description: "Walks 20 feet, uses assistive device, slower speed, mild gait deviations, or deviates 6-10 inches outside 12-inch walkway width"
      },
      1: {
        label: "Moderate Impairment",
        description: "Walks 20 feet, slow speed, abnormal gait pattern, evidence for imbalance, or deviates 10-15 inches outside 12-inch walkway width"
      },
      0: {
        label: "Severe Impairment",
        description: "Cannot walk 20 feet without assistance, severe gait deviations or imbalance, deviates greater than 15 inches outside 12-inch walkway width, or will not attempt task"
      }
    }
  },
  10: {
    name: "Steps (Stairs)",
    instruction: "Walk up these stairs as you would at home (i.e., using the rail if necessary). At the top, turn around and walk down.",
    scores: {
      3: {
        label: "Normal",
        description: "Alternating feet, no rail"
      },
      2: {
        label: "Mild Impairment",
        description: "Alternating feet, must use rail"
      },
      1: {
        label: "Moderate Impairment",
        description: "Two feet to a stair, must use rail"
      },
      0: {
        label: "Severe Impairment",
        description: "Cannot perform safely"
      }
    }
  }
};