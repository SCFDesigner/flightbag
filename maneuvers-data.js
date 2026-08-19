/* ==========================================================================
   SEL MANEUVERS — SOURCE DATA
   --------------------------------------------------------------------------
   SOURCE: US Aviation Academy "Single Engine Land Maneuvers (SEL Guide)",
           Revision 2, dated 3/16/2025.
           File: USAA-SEL-Maneuvers-Guide-Rev-2-3.16.2025-2.pdf

   Every speed, procedure step and ACS tolerance in this file is transcribed
   verbatim from that document. Page numbers are noted per maneuver so any
   value can be checked against the source.

   DO NOT estimate, round or "clean up" values. If the guide prints
   "97 mph or 80 kts", that is what appears here — the guide itself notes the
   speeds are generic and rounded, and that the POH/AFM for the specific
   aircraft governs.

   V-speed tokens in procedure text ([VR], [VG], [VFE], [VX], [VY], [VA],
   [VCC], [VAPP], [VSO]) are substituted at render time with the value for
   the selected aircraft.
   ========================================================================== */

/* --------------------------------------------------------------------------
   AIRCRAFT — Speed and power tables (SEL Guide pp. 5-10)
   -------------------------------------------------------------------------- */
const AIRCRAFT = {
  'C-152': {
    label: 'Cessna 152',
    sub: 'SINGLE',
    page: '5–6',
    // kts value is what the tool substitutes into procedure text.
    speeds: [
      { k: 'VR',    sym: 'V<sub>R</sub>',                 name: 'Rotation',                    mph: '58',        kts: '50' },
      { k: 'VRSF',  sym: 'V<sub>R</sub> Short Field',     name: 'Rotation — short field',      mph: '58',        kts: '50' },
      { k: 'VOBST', sym: 'Obstacle Clearance',            name: 'Obstacle clearance',          mph: '62',        kts: '54' },
      { k: 'VX',    sym: 'V<sub>X</sub>',                 name: 'Best angle of climb',         mph: '63',        kts: '55' },
      { k: 'VY',    sym: 'V<sub>Y</sub>',                 name: 'Best rate of climb',          mph: '77',        kts: '67' },
      { k: 'VCC',   sym: 'V<sub>CC</sub>',                name: 'Cruise climb',                mph: '92',        kts: '80' },
      { k: 'VA',    sym: 'V<sub>A</sub> Standard',        name: 'Maneuvering',                 mph: '112',       kts: '98' },
      { k: 'VAMAX', sym: 'V<sub>A</sub> Max (1670)',      name: 'Maneuvering — max gross',     mph: '119',       kts: '104' },
      { k: 'VAPP',  sym: 'V<sub>APP</sub>',               name: 'Approach',                    mph: '97',        kts: '80' },
      { k: 'VS',    sym: 'V<sub>S</sub>',                 name: 'Stall, clean',                mph: '46',        kts: '40' },
      { k: 'VSO',   sym: 'V<sub>SO</sub>',                name: 'Stall, landing config',       mph: '40',        kts: '35' },
      { k: 'VFE',   sym: 'V<sub>FE</sub> 0°–30°',         name: 'Max flap extended',           mph: '97',        kts: '85' },
      { k: 'VNO',   sym: 'V<sub>NO</sub>',                name: 'Max structural cruising',     mph: '127',       kts: '111' },
      { k: 'VNE',   sym: 'V<sub>NE</sub>',                name: 'Never exceed',                mph: '171',       kts: '149' },
      { k: 'VG',    sym: 'V<sub>G</sub>',                 name: 'Best glide',                  mph: '69',        kts: '60' },
      { k: 'XWIND', sym: 'Demonstrated X-wind',           name: 'Demonstrated crosswind',      mph: '13',        kts: '12' }
    ],
    pattern: [
      { name: 'Downwind',                    mph: '97',    kts: '85' },
      { name: 'Downwind Abeam (10° flaps)',  mph: '92',    kts: '80' },
      { name: 'Base (20° flaps)',            mph: '81',    kts: '70' },
      { name: 'Final Approach (30° flaps)',  mph: '69',    kts: '60' },
      { name: 'Final Short Field',           mph: '62',    kts: '54' },
      { name: 'Final Soft Field',            mph: '69',    kts: '60' },
      { name: 'Final (flapless)',            mph: '75–81', kts: '65–70' },
      { name: 'Holding',                     mph: '97',    kts: '85' },
      { name: 'Precision Approach',          mph: '92',    kts: '80' },
      { name: 'Non-precision Approach',      mph: '92',    kts: '80' }
    ],
    power0: [
      { cfg: 'Climb V<sub>X</sub> (55)',      pitch: '+8°', power: 'Full',      vsi: '+700' },
      { cfg: 'Climb V<sub>Y</sub> (67)',      pitch: '+7°', power: 'Full',      vsi: '+800' },
      { cfg: 'Cruise Climb (80)',             pitch: '+5°', power: 'Full',      vsi: '+500' },
      { cfg: 'Level Cruise (105)',            pitch: '0°',  power: '2300',      vsi: '0' },
      { cfg: 'Cruise Descent (100)',          pitch: '−2°', power: '2100',      vsi: '−500' },
      { cfg: 'Precision Descent (80)',        pitch: '−3°', power: '1700',      vsi: '−500' },
      { cfg: 'Approach Level (90)',           pitch: '+1°', power: '2000',      vsi: '0' },
      { cfg: 'Non-Precision Descent (80)',    pitch: '−3°', power: '1500',      vsi: '−700' }
    ],
    power10: [
      { cfg: 'Approach Level (90)',           pitch: '+1°', power: '2200',      vsi: '0' },
      { cfg: 'Precision Descent (70)',        pitch: '−2°', power: '1700',      vsi: '−500' },
      { cfg: 'Non-Precision (75)',            pitch: '−4°', power: '1500–1600', vsi: '−800' }
    ],
    rpmEffect: [
      { change: '100 RPM', effect: '5 kts' },
      { change: '100 RPM', effect: '100 ft / min' }
    ]
  },

  'C-172': {
    label: 'Cessna 172',
    sub: 'SINGLE',
    page: '7–8',
    speeds: [
      { k: 'VR',    sym: 'V<sub>R</sub>',                 name: 'Rotation',                    mph: '63',          kts: '55' },
      { k: 'VRSF',  sym: 'V<sub>R</sub> Short Field',     name: 'Rotation — short field',      mph: '59',          kts: '51' },
      { k: 'VOBST', sym: 'Obstacle Clearance',            name: 'Obstacle clearance',          mph: '66',          kts: '57' },
      { k: 'VX',    sym: 'V<sub>X</sub>',                 name: 'Best angle of climb',         mph: '69',          kts: '60' },
      { k: 'VY',    sym: 'V<sub>Y</sub>',                 name: 'Best rate of climb',          mph: '91',          kts: '79' },
      { k: 'VCC',   sym: 'V<sub>CC</sub>',                name: 'Cruise climb',                mph: '104',         kts: '90' },
      { k: 'VA',    sym: 'V<sub>A</sub> Standard',        name: 'Maneuvering (K–R/S models)',  mph: '106/113',     kts: '92/98' },
      { k: 'VAMAX', sym: 'V<sub>A</sub> Max (2300–2550)', name: 'Maneuvering (K–M/P–R/S)',     mph: '111/113/121', kts: '97/99/105' },
      { k: 'VAPP',  sym: 'V<sub>APP</sub>',               name: 'Approach',                    mph: '97',          kts: '85' },
      { k: 'VS',    sym: 'V<sub>S</sub>',                 name: 'Stall, clean',                mph: '51',          kts: '44' },
      { k: 'VSO',   sym: 'V<sub>SO</sub>',                name: 'Stall, landing config',       mph: '38',          kts: '33' },
      { k: 'VFE10', sym: 'V<sub>FE</sub> 10° (P/R/S)',    name: 'Max flap extended, 10°',      mph: '126',         kts: '110' },
      { k: 'VFE',   sym: 'V<sub>FE</sub> 10°–30°',        name: 'Max flap extended',           mph: '97',          kts: '85' },
      { k: 'VNO',   sym: 'V<sub>NO</sub>',                name: 'Max structural cruising',     mph: '148',         kts: '129' },
      { k: 'VNE',   sym: 'V<sub>NE</sub>',                name: 'Never exceed',                mph: '187',         kts: '163' },
      { k: 'VG',    sym: 'V<sub>G</sub>',                 name: 'Best glide',                  mph: '75',          kts: '65' },
      { k: 'XWIND', sym: 'Demonstrated X-wind',           name: 'Demonstrated crosswind',      mph: '17',          kts: '15' }
    ],
    pattern: [
      { name: 'Downwind',                    mph: '104',   kts: '90' },
      { name: 'Downwind Abeam (10° flaps)',  mph: '97',    kts: '85' },
      { name: 'Base (20° flaps)',            mph: '81–86', kts: '70–75' },
      { name: 'Final Approach (30° flaps)',  mph: '75–80', kts: '65–70' },
      { name: 'Final Short Field',           mph: '72',    kts: '62' },
      { name: 'Final Soft Field',            mph: '75–80', kts: '65–70' },
      { name: 'Final (flapless)',            mph: '75–80', kts: '65–70' },
      { name: 'Holding',                     mph: '104',   kts: '90' },
      { name: 'Precision Approach',          mph: '97',    kts: '85' },
      { name: 'Non-precision Approach',      mph: '97',    kts: '85' }
    ],
    power0: [
      { cfg: 'Climb V<sub>X</sub> (60)',      pitch: '+8°', power: 'Full',      vsi: '+700' },
      { cfg: 'Climb V<sub>Y</sub> (76)',      pitch: '+7°', power: 'Full',      vsi: '+800' },
      { cfg: 'Cruise Climb (90)',             pitch: '+5°', power: 'Full',      vsi: '+500' },
      { cfg: 'Level Cruise (110)',            pitch: '0°',  power: '2300',      vsi: '0' },
      { cfg: 'Cruise Descent (100)',          pitch: '−2°', power: '2100',      vsi: '−500' },
      { cfg: 'Precision Descent (85)',        pitch: '−3°', power: '1800',      vsi: '−500' },
      { cfg: 'Approach Level (90)',           pitch: '+1°', power: '2000',      vsi: '0' },
      { cfg: 'Non-Precision Descent (85)',    pitch: '−3°', power: '1600',      vsi: '−700' }
    ],
    power10: [
      { cfg: 'Approach Level (90)',           pitch: '+1°', power: '2200',      vsi: '0' },
      { cfg: 'Precision Descent (80)',        pitch: '−2°', power: '1700',      vsi: '−500' },
      { cfg: 'Non-Precision (80)',            pitch: '−4°', power: '1500–1600', vsi: '−800' }
    ],
    rpmEffect: [
      { change: '100 RPM', effect: '5 mph / 5 kts' },
      { change: '100 RPM', effect: '100 ft / min' }
    ]
  }
};

/* The guide lists Tecnam P2010 speed and power tables as
   "Pending / Not Currently Approved" (pp. 9-10) — no data to transcribe,
   so it is not offered as a selectable aircraft. */
const AIRCRAFT_PENDING = [
  { label: 'Tecnam P2010', note: 'Pending / Not Currently Approved in SEL Guide Rev 2 (pp. 9–10)' }
];

const CATEGORIES = {
  takeoff:   { label: 'Takeoffs',            color: '#8f6' },
  fundamental:{ label: 'Fundamentals',       color: '#4af' },
  stall:     { label: 'Stalls',              color: '#f96' },
  slow:      { label: 'Slow Flight',         color: '#fc6' },
  perf:      { label: 'Performance',         color: '#b58cff' },
  ground:    { label: 'Ground Reference',    color: '#3dc' },
  landing:   { label: 'Landings',            color: '#6cf' },
  emerg:     { label: 'Emergencies',         color: '#ff6b6b' }
};

const LEVELS = {
  P: { label: 'Private',          short: 'PVT'  },
  C: { label: 'Commercial',       short: 'COMM' },
  I: { label: 'Flight Instructor', short: 'CFI' }
};

/* --------------------------------------------------------------------------
   MANEUVERS
   Each entry:
     id, name, cat, page   — identity + source page in the SEL Guide
     ref                   — REFERENCE line, verbatim
     levels                — certificate levels the maneuver applies to
     desc / obj            — DESCRIPTION / OBJECTIVE, verbatim
     phases[]              — PROCEDURE / RECOVERY / EXIT step lists, verbatim
     notes[]               — NOTE blocks and preamble text, verbatim
     planning[] / faults[] — LEARNING CONSIDERATIONS bullets, verbatim
     acs{P|C|I}            — Airman Certification Standards columns, verbatim
     acsNotes[]            — ACS "Note" rows, verbatim
   -------------------------------------------------------------------------- */
const MANEUVERS = [

/* ===================== TAKEOFFS ===================== */
{
  id: 'normal-takeoff', name: 'Normal & Crosswind Takeoff', cat: 'takeoff', page: '12–13',
  ref: 'AFH § 6-3 and 6-6, ACS Private / Commercial / Flight Instructor.',
  levels: ['P','C','I'],
  desc: 'The takeoff and climb involve the movement of the airplane from its starting position on the runway to the point where a positive climb to a safe maneuvering altitude has been established.',
  obj: 'Develop the pilot’s proficiency on normal and crosswind takeoffs.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Taxi onto runway as normal.',
      'Apply proper crosswind correction with the ailerons as required.',
      'Smoothly apply full take-off power with brakes released. Verify engine instruments are in the green and airspeed is alive.',
      'Maintain directional control by use of the rudder only. NO BRAKES.',
      'At [VR] smoothly apply back pressure. Greater right rudder pressure will be required due to the increase in p-factor. Maintain a wings level attitude and allow the airplane to fly itself off the ground.',
      'Establish a proper pitch attitude allowing the airplane to accelerate to [VY].',
      'At approximately 200’ AGL perform the climb flow check, then verify checklist and maintain runway alignment and verify systems are operating normally.',
      'Maintain runway heading until 300’ below TPA or as directed by ATC before turning crosswind.',
      'Once out of the airport traffic area and at a safe altitude reduce the pitch attitude to establish cruise climb airspeed.'
    ]}
  ],
  notes: [
    'Crosswind takeoff: a crosswind will tend to turn the airplane nose into the wind (weather vaning). To counteract this, aileron control is turned into the wind. As the controls become more effective with an increase in speed the amount of aileron deflection required will become less.',
    'The technique for crosswind takeoff will differ slightly to a normal takeoff. A technique using a slightly higher rotation speed and pulling the airplane off of the runway should be used.',
    'Take off in a strong crosswind is normally achieved with flaps at zero. Depending on runway length 10˚ may be used on the Cessna.',
    'During acceleration on a soft field take off, once airborne the airplane must be crabbed into the wind rather than the wing low method.'
  ],
  planning: [
    'Runway length, width, surface condition.',
    'Effect of high-density altitude.',
    'Clear takeoff path.',
    'Anticipate the effect of wind drift, yaw, necessary control inputs.',
    'Wind shear and wake turbulence considerations.'
  ],
  faults: [
    'Abrupt or over rotation during rotation.',
    'Absence or inadequate rudder inputs to compensate for left-turning tendencies.',
    'Failure to detect abnormal indications and take decisive action.',
    'Failure to maintain extended runway centerline during climb out.'
  ],
  acs: {
    P: { Airspeed: 'Rotate and liftoff at recommended airspeed, climb at V<sub>Y</sub> + 10/-5 KIAS', Altitude: 'NA', Heading: 'Maintain Directional Control' },
    C: { Airspeed: 'Rotate and liftoff at recommended airspeed, climb at V<sub>Y</sub> +/-5 KIAS',    Altitude: 'NA', Heading: 'Maintain Directional Control' }
  },
  acsNotes: [
    'Clear area, taxi into takeoff position, align airplane with runway centerline.',
    'Advance throttle smoothly to takeoff power, confirm proper indications prior to rotation.',
    'Maintain V<sub>Y</sub> within standard to a safe maneuvering altitude.',
    'Crosswind takeoff: apply appropriate x-wind correction.'
  ]
},

{
  id: 'soft-field-takeoff', name: 'Soft Field Takeoff', cat: 'takeoff', page: '14–15',
  ref: 'AFH § 6-13, ACS Private / Commercial / Flight Instructor.',
  levels: ['P','C','I'],
  desc: 'The common departure technique for getting the airplane airborne as quickly as possible to eliminate drag caused by tall grass, soft turf, mud, snow, etc.',
  obj: 'Develop the pilot’s ability to obtain maximum performance from the airplane while performing a soft field takeoff.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Hold short of runway, flaps as required and hold full back elevator.',
      'Taxi onto the runway making the turn as shallow as possible to avoid the nose wheel digging into the soft surface, NO BRAKES.',
      'Apply proper crosswind correction with the ailerons as required.',
      'Smoothly apply full power while adding back pressure on the yoke. Do not advance the throttle too rapidly as this will cause the tail to strike.',
      'Adjust the pitch by smooth movements of the elevator to maintain an approximate [VY] attitude.',
      'Verify engine instruments are in the green, airspeed alive.',
      'As the airspeed increases the flight controls will become more effective so the aileron correction applied at the beginning of the take-off roll will need to be gradually reduced.',
      'Maintain directional control by use of the rudder only. NO BRAKES.',
      'Allow the airplane to leave the runway as soon as possible.',
      'Once the airplane becomes airborne reduce the pitch attitude allowing the airplane to accelerate to [VX] or [VY] as required in ground effect.',
      'At [VX] or [VY] smoothly start a climb and retract flaps.',
      'At approximately 200’ AGL perform the climb flow check. Verify flaps up, then verify checklist.',
      'Maintain runway heading until 300’ below TPA or as directed by ATC before turning crosswind.',
      'Once out of the airport traffic area and at a safe altitude reduce the pitch attitude to establish cruise climb airspeed.'
    ]}
  ],
  notes: [],
  planning: [
    'Runway length, width, surface condition.',
    'Effect of high-density altitude.',
    'Clear takeoff path.',
    'Anticipate the effect of wind drift, yaw, necessary control inputs.',
    'Wind shear and wake turbulence considerations.'
  ],
  faults: [
    'Abrupt or over rotation during rotation resulting in stall warning during lift off.',
    'Absence or inadequate rudder inputs to compensate for left turning tendencies.',
    'Failure to detect abnormal indications and take decisive action.',
    'Failure to maintain extended runway centerline during climb out.'
  ],
  acs: {
    P: { Airspeed: 'Climb at V<sub>X</sub> or V<sub>Y</sub> + 10/-5 KIAS', Altitude: 'NA', Heading: 'Maintain Directional Control' },
    C: { Airspeed: 'Climb at V<sub>X</sub> or V<sub>Y</sub> +/- 5 KIAS',   Altitude: 'NA', Heading: 'Maintain Directional Control' }
  },
  acsNotes: [
    'Clear area, taxi into takeoff position and align airplane on runway centerline without stopping, while advancing throttle smoothly to takeoff power.',
    'Confirm proper indications prior to rotation.',
    'Lift off at the lowest possible airspeed and remain in ground effect while accelerating to V<sub>X</sub> or V<sub>Y</sub>.',
    'Maintain V<sub>X</sub> or V<sub>Y</sub> within standard to a safe maneuvering altitude.'
  ]
},

{
  id: 'short-field-takeoff', name: 'Short Field Takeoff', cat: 'takeoff', page: '16–17',
  ref: 'AFH § 6-11, ACS Private / Commercial / Flight Instructor.',
  levels: ['P','C','I'],
  desc: 'Maximum performance takeoff used to depart from fields with short runways or with departure ends restricted by obstruction.',
  obj: 'To develop the pilot’s ability to obtain maximum performance from the airplane while performing a short field takeoff and clearing all obstacles in the departure path safely.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Hold short of runway, position flaps as required.',
      'Taxi the airplane into position using the maximum available runway.',
      'Apply brakes.',
      'Apply proper crosswind correction with the ailerons as required.',
      'Smoothly apply full power holding the brakes.',
      'Verify engine instruments are in the green.',
      'Release brakes while holding centerline and accelerate to [VRSF].',
      'Maintain directional control by use of the rudder only. NO BRAKES.',
      'At [VRSF] smoothly apply back pressure. Greater right rudder pressure will be required due to the increase in p-factor. Allow the airplane to fly itself off the ground.',
      'Establish the proper pitch attitude. Allow the airplane to climb out at the published obstacle clearance speed.',
      'Passing through the 50’ height establish a pitch for [VY] attitude while retracting flaps.',
      'At approximately 200’ AGL, perform the climb flow check. Verify flaps up, then verify checklist.',
      'Maintain runway heading until 300’ below TPA or as directed by ATC before turning crosswind.',
      'Once out of the airport traffic area and at a safe altitude reduce the pitch attitude to establish cruise climb airspeed.'
    ]}
  ],
  notes: [],
  planning: [
    'Runway length, width, surface condition.',
    'Effect of high-density altitude.',
    'Clear takeoff path.',
    'Anticipate the effect of wind drift, yaw, necessary control inputs.',
    'Wind shear and wake turbulence considerations.'
  ],
  faults: [
    'Abrupt or over rotation during rotation.',
    'Absence or inadequate rudder inputs to compensate for left turning tendencies.',
    'Failure to detect abnormal indications and take decisive action.',
    'Failure to maintain extended runway centerline during climb out.'
  ],
  acs: {
    P: { Airspeed: 'V<sub>X</sub> + 10/-5 KIAS prior to clearing 50 foot obstacle, V<sub>Y</sub> +10/-5 KIAS after obstacle cleared', Altitude: 'NA', Heading: 'Maintain Directional Control' },
    C: { Airspeed: 'V<sub>X</sub> +/-5 KIAS prior to clearing 50 foot obstacle, V<sub>Y</sub> +/-5 KIAS after obstacle cleared',      Altitude: 'NA', Heading: 'Maintain Directional Control' }
  },
  acsNotes: [
    'Clear area, taxi into takeoff position and align airplane on runway centerline while utilizing maximum available takeoff area.',
    'Apply brakes while setting engine power to achieve max performance.',
    'Confirm takeoff power prior to brake release and proper indications prior to rotation.',
    'After obstacle clearance, maintain V<sub>Y</sub> within standard to a safe maneuvering altitude.'
  ]
},

/* ===================== FUNDAMENTALS ===================== */
{
  id: 'clearing-turns', name: 'Clearing Turns', cat: 'fundamental', page: '19',
  ref: 'AFH § 1-12, ACS Private / Commercial / Flight Instructor.',
  levels: ['P','C','I'],
  memoryAid: 'CC MALS — Refer to FOM Vol 1, Unit 5, Section 1, Appendix – General: Section 11.16',
  desc: 'Prior to conducting training maneuvers and/or procedures, the pilot typically performs at least 180° of turning to clear the area of obstacles and/or traffic. This is typically accomplished with two 90˚ turns in both directions to scan the area using proper scanning techniques looking for anything that could interfere with the safe execution of the intended maneuver about to be performed.',
  obj: 'To ensure the area is clear of any conflicting traffic or obstacles.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Begin a shallow turn to the left while scanning the area for traffic and obstacles.',
      'After completing the first 90˚ turn, a shallow turn back in the opposite direction for at least another 90˚ (180˚ total in turning) should be completed. The pilot may elect to vary the directions and degrees of each turn depending on how the maneuver will be set up along with other factors such as traffic or direction of flight.',
      'Upon completion of at least 180° of turning while using proper scanning techniques, do a final check of the ADS-B traffic if equipped.',
      'Execute the maneuver safely.'
    ]}
  ],
  notes: [
    'When possible, clearing turns should be done to the left first, so as not to turn into traffic overtaking your aircraft from the right. Any combination of turning is acceptable as long as a minimum of 180° of clearing turning has been accomplished.'
  ],
  planning: [], faults: [],
  acs: {}, acsNotes: []
},

/* ===================== STALLS ===================== */
{
  id: 'power-off-stall', name: 'Power-Off Stalls', cat: 'stall', page: '21–22',
  ref: 'AFH § 5-17, ACS Private / Commercial / Flight Instructor.',
  levels: ['P','C','I'],
  desc: 'The aircraft will be configured to approach speed in a landing configuration in simulation of an accidental stall occurring during the landing approach.',
  obj: 'To develop the pilot’s recognition of indications leading to stalls in power off situations and make immediate and effective recoveries with minimal altitude loss. Power off stalls must be practiced from both the landing and the approach attitude.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Select a visual reference point on the horizon and cross check with the heading indicator.',
      'Reduce power to 1500 rpm, increase elevator pressure to hold altitude. Trim as required.',
      'Below [VFE] gradually extend flaps to full position.',
      'Maintain altitude and heading as airspeed decreases.',
      'When airplane approaches [VG] establish a descent ~500 fpm until desired level point (hard deck).',
      'At hard deck reduce the throttle to idle, maintain coordination and simultaneously increase back pressure to an attitude that will induce the stall. (Just above the horizon) maintain coordination, up to 20˚ of bank may be added at this time if performing an approach stall.',
      'Announce the indications of the stall (horn, buffet, stall). If the stall breaks the nose will drop and back pressure should be relaxed.'
    ]},
    { name: 'RECOVERY', steps: [
      'Reduce the angle of attack, apply full power, and maintain heading.',
      'Retract flaps (20 degrees or T/O) and pitch the airplane to the horizon ([VX] attitude).',
      'Once a positive rate of climb is noted, retract the flaps to 10˚.',
      'Retract the final flaps, accelerate to [VY].',
      'Once [VY], level off and accelerate to cruise settings.'
    ]}
  ],
  notes: [
    'Power-off stalls are straight ahead and are made with flaps down, gear down.',
    'Approach stalls are turning stalls with flaps down, gear down. Bank not to exceed 20 degrees.'
  ],
  planning: [
    'Factors affecting stall speed.',
    'Entry techniques.',
    'Excessive pitch attitude to induce stall.',
    'How to recognize first indications of a stall.',
    'Recognize the difference between imminent and full stalls.',
    'Flight conditions where an unintentional stall may occur.',
    'The effect of ailerons and rudder on stalls and spins.',
    'Stall/spin awareness.'
  ],
  faults: [
    'Slow reaction, allowing further development of the stall.',
    'Attempting to stop yaw by using ailerons.',
    'Failure to maintain coordinated flight during stall.',
    'Abrupt control inputs during the recovery resulting in a secondary stall.',
    'Excessive altitude loss caused by a lower than level flight attitude.',
    'Failure to retract flaps.'
  ],
  acs: {
    P: { Airspeed: 'Accelerate to V<sub>X</sub> or V<sub>Y</sub> before the final flap retraction', Altitude: 'NA', Heading: '+/- 10˚', Bank: 'Not to exceed 20˚ +/- 10˚' },
    C: { Airspeed: 'Accelerate to V<sub>X</sub> or V<sub>Y</sub> before the final flap retraction', Altitude: 'NA', Heading: '+/- 10˚', Bank: 'Not to exceed 20˚ +/- 5˚' }
  },
  acsNotes: ['Completed no lower than 1,500’ AGL.']
},

{
  id: 'power-on-stall', name: 'Power-On Stalls', cat: 'stall', page: '23–24',
  ref: 'AFH § 5-18, ACS Private / Commercial / Flight Instructor.',
  levels: ['P','C','I'],
  desc: 'The aircraft will be configured in a normal takeoff or climb out configuration in simulation of an accidental stall occurring during one of these phases.',
  obj: 'To develop the pilot’s recognition of indications leading to stalls in power on situations and make immediate and effective recoveries with minimal altitude loss. Power on stalls must be practiced from both the takeoff and departure attitude.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Select a visual reference point on the horizon and cross check with the heading indicator.',
      'Reduce power to 1500 rpm and increase elevator pressure to hold altitude. Trim as required.',
      'Maintain altitude and heading as airspeed decreases.',
      'As the airplane approaches [VR], smoothly increase the power to full, simultaneously raise the pitch to an attitude that will induce the stall. Maintain coordination. Up to 20˚ of bank may be added at this time if performing a departure stall.',
      'Announce the indications of the stall (horn, buffet, stall). If the stall breaks the nose will drop and back pressure should be relaxed.'
    ]},
    { name: 'RECOVERY', steps: [
      'Reduce the angle of attack, ensure full power is applied, and maintain heading.',
      'Pitch the airplane to the horizon ([VY] attitude).',
      'Once [VY], level off and accelerate to cruise settings.'
    ]}
  ],
  notes: [
    'Power-on stalls are straight ahead and are made with the flaps up, gear up.',
    'Departure stalls are turning stalls with the flaps up, gear up. Bank not to exceed 20 degrees.'
  ],
  planning: [
    'Factors affecting stall speed.',
    'Entry techniques.',
    'Excessive pitch attitude to induce stall.',
    'How to recognize first indications of a stall.',
    'Recognize difference between imminent and full stalls.',
    'Flight conditions where unintentional stall may occur.',
    'The effect of ailerons and rudder on stalls and spins.',
    'Stall/spin awareness.'
  ],
  faults: [
    'Slow reaction, allowing further development of the stall.',
    'Attempting to stop yaw by use of ailerons.',
    'Failure to maintain coordinated flight during stall.',
    'Abrupt control inputs during the recovery resulting in a secondary stall.',
    'Excessive altitude loss caused by a lower than level flight attitude.'
  ],
  acs: {
    P: { Airspeed: 'Accelerate to V<sub>X</sub> or V<sub>Y</sub> during recovery', Altitude: 'NA', Heading: '+/- 10˚', Bank: 'Not to exceed 20˚ +/- 10˚' },
    C: { Airspeed: 'Accelerate to V<sub>X</sub> or V<sub>Y</sub> during recovery', Altitude: 'NA', Heading: '+/- 10˚', Bank: 'Not to exceed 20˚ +/- 10˚' }
  },
  acsNotes: ['Set power to no less than 65%.', 'Completed no lower than 1,500’ AGL.']
},

{
  id: 'accelerated-stall', name: 'Accelerated Stall', cat: 'stall', page: '25–26',
  ref: 'AFH § 5-19, ACS Commercial / Flight Instructor.',
  levels: ['C','I'],
  subtitle: '(First Indication)',
  desc: 'A stall at a higher indicated airspeed when excessive maneuvering loads are imposed by steep turns, pull-ups, or other abrupt changes in its flight path. Stalls entered from such flight situations are called “accelerated stalls,” a term which has no reference to the airspeeds involved.',
  obj: 'To teach the pilot to understand aerodynamic factors associated with accelerated stalls and that an aircraft can stall at airspeeds above the power-off stalling speed of the aircraft.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Select an entry altitude that allows the task to be completed no lower than 3,000 ft AGL.',
      'Select a visual reference point on the horizon and cross check with Heading Indicator.',
      'Reduce power to 1500 rpm.',
      'Maintain altitude as airspeed decreases.',
      'Maintain heading with visual reference point.',
      'Below [VG], establish a bank angle of 45°, increase elevator back pressure steadily and firmly to induce a stall.',
      'Announce the indications of the stall (horn and buffet).'
    ]},
    { name: 'RECOVERY', steps: [
      'Simultaneously reduce the angle of bank, reducing pitch and increasing power.',
      'Pitch the airplane to the horizon.',
      'Return to straight and level flight with a minimum loss of altitude.'
    ]}
  ],
  notes: ['Accelerated stalls are turning stalls with the flaps up, gear up. Bank not to exceed 45 degrees.'],
  planning: [
    'Factors affecting stall speed.',
    'Entry techniques.',
    'Excessive pitch attitude to induce stall.',
    'How to recognize first indications of a stall.',
    'Recognize difference between imminent and full stalls.',
    'Flight conditions where unintentional stall may occur.',
    'The effect of ailerons and rudder on stalls and spins.',
    'Stall/spin awareness.'
  ],
  faults: [
    'Slow reaction, allowing further development of the stall.',
    'Attempting to stop yaw by use of ailerons.',
    'Failure to maintain coordinated flight during stall.',
    'Abrupt control inputs during the recovery resulting in a secondary stall.',
    'Excessive altitude loss caused by a lower than level flight attitude.'
  ],
  acs: {
    C: { Airspeed: 'Establishes steady flight condition and airspeed', Altitude: 'NA', Heading: 'NA', Bank: '45°' }
  },
  acsNotes: ['Completed no lower than 3,000’ AGL.']
},

{
  id: 'secondary-stall', name: 'Secondary Stalls', cat: 'stall', page: '27–28',
  ref: 'AFH § 5-18, ACS Flight Instructor.',
  levels: ['I'],
  subtitle: '(CFI Demonstration Only) (First Indication)',
  desc: 'This type of stall normally occurs during recovery from a preceding primary stall caused by attempting to hasten the completion of a stall recovery before the airplane has regained sufficient airspeed.',
  obj: 'To develop the pilot’s awareness of the effect of improper stall recovery techniques and recognition of the approach to a secondary stall.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Select a visual reference point on the horizon and cross check with the heading indicator.',
      'Reduce power to 1500 rpm, increase elevator pressure to hold altitude. Trim as required.',
      'Below [VFE] gradually extend flaps to full position.',
      'Maintain altitude and heading as airspeed decreases.',
      'When airplane approaches [VG], establish a descent ~500 fpm until desired level point (hard deck).',
      'At hard deck reduce the throttle to idle, maintain coordination and simultaneously increase back pressure to an attitude that will induce the stall. (Just above the horizon)',
      'Announce the indications of the stall (horn, buffet, stall). If the stall breaks the nose will drop and back pressure should be relaxed.',
      'Reduce the angle of attack smoothly to break stall, maintain heading.',
      'Prior to regaining flying speed, increase back elevator pressure to initiate secondary stall. Power may be added to imitate a powered secondary stall.'
    ]},
    { name: 'RECOVERY', steps: [
      'Reduce the angle of attack smoothly to break stall, apply full power, maintain heading.',
      'Retract flaps to (20˚ or T/O) and pitch the airplane to the horizon ([VX] attitude).',
      'Once a positive rate of climb is noted raise the flaps to 10˚ if applicable.',
      'As airspeed increases beyond [VG] raise the final flaps, accelerate to [VY].',
      'Once [VY], level off and accelerate to cruise settings.'
    ]}
  ],
  notes: [],
  planning: [
    'Factors affecting stall speed.',
    'Entry techniques.',
    'Excessive pitch attitude to induce stall.',
    'How to recognize first indications of a stall.',
    'Recognize difference between imminent and full stalls.',
    'Flight conditions where unintentional stall may occur.',
    'The effect of ailerons and rudder on stalls and spins.',
    'Stall/spin awareness.'
  ],
  faults: [
    'Slow reaction, allowing further development of the stall.',
    'Attempting to stop yaw by use of ailerons.',
    'Failure to maintain coordinated flight during stall.',
    'Abrupt control inputs during the recovery resulting in a secondary stall.',
    'Excessive altitude loss caused by a lower than level flight attitude.',
    'Failure to retract flaps.'
  ],
  acs: {
    I: { Airspeed: 'Accelerate to V<sub>X</sub> or V<sub>Y</sub> before the final flap retraction', Altitude: 'NA', Heading: '+/- 5˚', Bank: 'NA' }
  },
  acsNotes: ['Completed no lower than 3,000’ AGL.']
},

{
  id: 'cross-controlled-stall', name: 'Cross-Controlled Stalls', cat: 'stall', page: '29–30',
  ref: 'AFH § 5-20, ACS Flight Instructor.',
  levels: ['I'],
  subtitle: '(CFI Demonstration Only) (First Indication)',
  desc: 'This type of stall occurs with the controls “crossed” — aileron pressure applied in one direction and rudder pressure applied the opposite direction. When excessive back elevator is applied a “cross-control stall” may result. This type of stall may occur while turning onto final and overshooting the approach course.',
  obj: 'To develop the pilot’s awareness of the effect of improper control techniques and recognition of the approach to a cross-control stall, and timely airplane control recovery techniques.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Select a visual reference point on the horizon and cross check with the heading indicator.',
      'Reduce power to 1500 rpm, increase elevator pressure to hold altitude. Trim as required.',
      'Trim for [VG].',
      'Maintain altitude and heading as airspeed decreases.',
      'When airplane approaches [VG], reduce the throttle to idle, maintain altitude and roll into a medium bank turn that would overshoot the centerline of the runway.',
      'During the turn, excessive rudder pressure should be applied in the direction of the turn, but the bank held constant by applying opposite aileron pressure.',
      'Increase back pressure to an attitude that will induce the stall. (Just above the horizon).',
      'Announce the indications of the stall (horn, buffet, stall). If the stall breaks the nose will drop and no more back pressure should be applied.'
    ]},
    { name: 'RECOVERY', steps: [
      'Reduce the angle of attack smoothly to break stall, apply full power, maintain heading.',
      'Pitch the airplane to climb attitude ([VX] attitude).',
      'As airspeed increases beyond [VG], accelerate to [VY].',
      'Once [VY], level off and accelerate to cruise settings.'
    ]}
  ],
  notes: ['Flaps are not recommended due to the increase in stall/spin severity and delayed recovery, therefore DO NOT USE FLAPS during this demonstration.'],
  planning: [
    'Factors affecting stall speed.',
    'Entry techniques.',
    'Excessive pitch attitude to induce stall.',
    'How to recognize first indications of a stall.',
    'Recognize difference between imminent and full stalls.',
    'Flight conditions where unintentional stall may occur.',
    'The effect of ailerons and rudder on stalls and spins.',
    'Stall/spin awareness.',
    'To avoid the possibility of exceeding the airplane’s limitations, the pilot should not extend the flaps.'
  ],
  faults: [
    'Slow reaction, allowing further development of the stall.',
    'Attempting to stop yaw by use of ailerons.',
    'Failure to maintain coordinated flight during stall.',
    'Abrupt control inputs during the recovery resulting in a secondary stall.',
    'Excessive altitude loss caused by a lower than level flight attitude.'
  ],
  acs: {
    I: { Airspeed: 'Establish V<sub>G</sub> during entry', Altitude: 'NA', Heading: 'NA', Bank: 'Enter a medium-banked turn while applying excess rudder, holding a constant bank, and adding elevator back pressure to prevent the nose lowering' }
  },
  acsNotes: [
    'Acknowledge cues at the first indication of stall (horn, buffet, etc.), recover at first indication or after full stall as specified by evaluator.',
    'Completed no lower than 3,000’ AGL.'
  ]
},

{
  id: 'elevator-trim-stall', name: 'Elevator Trim Stalls', cat: 'stall', page: '31–32',
  ref: 'AFH § 5-20, ACS Flight Instructor.',
  levels: ['I'],
  subtitle: '(CFI Demonstration Only) (First Indication)',
  desc: 'This type of stall normally occurs when full power is applied for takeoff or go-around and approach trim maintained while positive control of the airplane is not maintained.',
  obj: 'To teach the pilot the importance of making smooth power applications, overcoming strong trim forces, maintaining positive control of the airplane to hold safe flight attitudes, and using proper and timely trim techniques.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Select a visual reference point on the horizon and cross check with the heading indicator.',
      'Reduce power to 1500 rpm, increase elevator pressure to hold altitude. Trim as required.',
      'Below [VFE] gradually extend flaps to full position (Flaps are optional).',
      'Maintain altitude and heading as airspeed decreases.',
      'Trim aircraft with full aft elevator.',
      'At [VG], smoothly apply full power and a pitch attitude which will induce a stall.',
      'Announce the indications of the stall (horn, buffet, stall). If the stall breaks the nose will drop and no more back pressure should be applied.'
    ]},
    { name: 'RECOVERY', steps: [
      'Reduce the angle of attack smoothly to break stall, apply full power, maintain heading.',
      'Retract flaps (20˚ or T/O if applicable) and pitch the airplane to the horizon ([VX] attitude).',
      'Once a positive rate of climb is noted raise the flaps to 10˚ if applicable.',
      'As positive rate of climb is established raise the final flaps, accelerate to [VY].',
      'Once [VY], level off and accelerate to cruise settings.'
    ]}
  ],
  notes: [],
  planning: [
    'Factors affecting stall speed.',
    'Entry techniques.',
    'Excessive pitch attitude to induce stall.',
    'How to recognize first indications of a stall.',
    'Recognize difference between imminent and full stalls.',
    'Flight conditions where unintentional stall may occur.',
    'The effect of ailerons and rudder on stalls and spins.',
    'Stall/spin awareness.'
  ],
  faults: [
    'Slow reaction, allowing further development of the stall.',
    'Attempting to stop yaw by use of ailerons.',
    'Failure to maintain coordinated flight during stall.',
    'Abrupt control inputs during the recovery resulting in a secondary stall.',
    'Excessive altitude loss caused by a lower than level flight attitude.',
    'Failure to retract flaps.'
  ],
  acs: {
    I: { Airspeed: 'Accelerate to V<sub>X</sub> or V<sub>Y</sub> before the final flap retraction', Altitude: 'NA', Heading: 'NA', Bank: 'NA' }
  },
  acsNotes: [
    'Completed no lower than 3,000’ AGL.',
    'Advance throttle to the max allowable power as in a go-around to initiate stall.',
    'Acknowledge cues at the first indication of stall (horn, buffet, etc.), recover at first indication or after full stall as specified by evaluator.'
  ]
},

/* ===================== SLOW FLIGHT ===================== */
{
  id: 'slow-flight-dirty', name: 'Slow Flight (Dirty)', cat: 'slow', page: '34–35',
  ref: 'AFH § 5-9, ACS Private / Commercial / Flight Instructor.',
  levels: ['P','C','I'],
  subtitle: 'Landing Configuration',
  desc: 'This maneuver is to demonstrate the controllability and flight characteristics of an airplane operating at minimum airspeed. Establishing airspeed and configurations that will be encountered during climbs and descents, go around and approaches to landing without stalling the aircraft. Also establishes and maintains an airspeed at which any further increase in angle of attack, increase in load factor, or reduction in power, would result in an immediate stall.',
  obj: 'To develop the pilot’s sense of feel and control, also the pilot’s proficiency in performing maneuvers that require slow airspeeds. While performing the maneuver, turns in opposite directions, as well as descents and climbs must be practiced.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Select a visual reference point on the horizon and cross check with heading indicator.',
      'Reduce power to an approach power setting.',
      'Below [VFE] gradually extend flaps to full position.',
      'Maintain altitude as airspeed decreases.',
      'Maintain heading with visual reference point.',
      'As the airplane reduces to stall airspeed, increase power to maintain altitude.',
      'Maintain desired airspeed just above stall by using pitch.',
      'Trim as required.',
      'Maneuver while maintaining airspeed by performing a 90˚ climbing turn to designated heading. Maneuver while maintaining airspeed by performing a 90˚ descending turn in the opposite direction and returning to level flight on designated heading.'
    ]},
    { name: 'RECOVERY', steps: [
      'Apply full power and maintain desired altitude and heading.',
      'Retract flaps to 20˚ or T/O.',
      'Maintain desired altitude and heading, allow airspeed to increase.',
      'Retract flaps to 10˚ or UP.',
      'Maintain desired altitude and heading, allow airspeed to increase.',
      'Once [VX] has been established, retract remaining flaps.',
      'Return to training cruise settings.'
    ]}
  ],
  notes: [],
  planning: [
    'Relationship of configuration, weight, center of gravity, maneuvering load, angle of bank and power to flight characteristics and controllability.',
    'Relationship of the maneuver to critical flight situations.',
    'Coordination of flight controls and left turn tendencies.',
    'Understanding the relationship of power available vs. power required on the back side of the power curve (reverse command).'
  ],
  faults: [
    'Slow reaction, allowing development of a stall.',
    'Failure to maintain coordinated flight.',
    'Abrupt control inputs.',
    'Failure to hold altitude on recovery.',
    'Failure to retract flaps.'
  ],
  acs: {
    P: { Airspeed: '+10 / -0 KIAS', Altitude: '+/- 100’', Heading: '+/- 10˚', Bank: '+/- 10˚' },
    C: { Airspeed: '+5 / -0 KIAS',  Altitude: '+/- 50’',  Heading: '+/- 10˚', Bank: '+/- 5˚' }
  },
  acsNotes: [
    'Completed no lower than 1,500’ AGL.',
    'Establish airspeed at which any further increase in angle of attack, load factor, or reduction in power would result in stall warning (buffet, horn, etc.).'
  ]
},

{
  id: 'slow-flight-clean', name: 'Slow Flight (Clean)', cat: 'slow', page: '36–37',
  ref: 'AFH § 5-9, ACS Private / Commercial / Flight Instructor.',
  levels: ['P','C','I'],
  subtitle: 'Takeoff Configuration',
  desc: 'This maneuver is to demonstrate the controllability and flight characteristics of an airplane operating at minimum controllable airspeed. Establish airspeeds and configurations that will be encountered during takeoffs, climbs and descents, go arounds, and approaches to landing. Also establishes and maintains an airspeed at which any further increase in angle of attack, increase in load factor, or reduction in power, would result in an immediate stall.',
  obj: 'To develop the pilot’s sense of feel and control, also the pilot’s proficiency in performing maneuvers that require slow airspeeds. While performing the maneuver, turns in opposite directions, as well as descents and climbs must be practiced.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Select a visual reference point on the horizon and cross check with heading indicator.',
      'Reduce power to 1500 rpm.',
      'Maintain altitude as airspeed decreases.',
      'Maintain heading with visual reference point.',
      'As the airplane slows to stall airspeed, increase power to approximately 1700 rpm.',
      'Maintain desired airspeed just above stall.',
      'Trim as required.',
      'Maneuver while maintaining airspeed by performing a 90˚ climbing turn to designated heading. Maneuver while maintaining airspeed by performing a 90˚ descending turn in the opposite direction and returning to level flight on designated heading.'
    ]},
    { name: 'RECOVERY', steps: [
      'Apply full power and maintain desired altitude and heading.',
      'Maintain desired altitude and heading, allow airspeed to increase.',
      'Return to training cruise settings.'
    ]}
  ],
  notes: [],
  planning: [
    'Relationship of configuration, weight, center of gravity, maneuvering load, angle of bank and power to flight characteristics and controllability.',
    'Relationship of the maneuver to critical flight situations.',
    'Coordination of flight controls and left turn tendencies.',
    'Understanding the relationship of power available vs. power required on the back side of the power curve (reverse command).'
  ],
  faults: [
    'Slow reaction, allowing development of a stall.',
    'Failure to maintain coordinated flight.',
    'Abrupt control inputs.',
    'Failure to hold altitude on recovery.'
  ],
  acs: {
    P: { Airspeed: '+10 / -0 KIAS', Altitude: '+/- 100’', Heading: '+/- 10˚', Bank: '+/- 10˚' },
    C: { Airspeed: '+5 / -0 KIAS',  Altitude: '+/- 50’',  Heading: '+/- 10˚', Bank: '+/- 5˚' }
  },
  acsNotes: ['Completed no lower than 1,500’ AGL.']
},

/* ===================== PERFORMANCE ===================== */
{
  id: 'steep-turns', name: 'Steep Turns', cat: 'perf', page: '38–39',
  ref: 'AFH § 10-1, ACS Private / Commercial / Flight Instructor.',
  levels: ['P','C','I'],
  desc: 'This maneuver consists of two 360˚ turns in opposite directions, while maintaining 45˚ (50˚ for Commercial) of bank and your desired altitude. The basic aerodynamic principle involved with a steep turn is that as bank angle increases the horizontal component of lift increases and the vertical component of lift decreases, it therefore becomes necessary to increase back pressure on the yoke. The increase in back pressure increases tail down force increasing the angle of attack and increasing drag.',
  obj: 'To develop the pilot’s smoothness, coordination, orientation, division of attention and control techniques while executing high performance turns.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Select a visual reference point on the horizon (cross reference with heading indicator).',
      'Set the power to 2300 rpm to achieve at or below [VA].',
      'Roll into a coordinated left or right turn with a bank angle of 45˚ (50˚).',
      'Passing through a bank of approximately 30˚, a slight increase in back pressure will be required, trim as required.',
      'Add ~100-200 RPM power to maintain airspeed.',
      'Roll out on the entry heading; lead the roll out approximately ½ of the bank angle.',
      'As you transition out of the maneuver the power should be reduced to the original setting and the back pressure relaxed. If elevator trim is used it must be taken out to avoid ballooning on roll out.',
      'Execute the second turn in the opposite direction and repeat.'
    ]}
  ],
  notes: [
    'Load factors increase as the bank angle becomes greater. Therefore, stall speeds will increase. Avoid over banking the airplane.',
    'During changes in attitude, focus should be off the nose of the airplane in relation to the horizon.'
  ],
  planning: [
    'Load factors caused by high bank turns.',
    'Turning performance — radius vs. rate.',
    'Load factor and stall speed.',
    'Increase in induced drag requires an increase in power.',
    'Overbanking tendencies during high bank turns.'
  ],
  faults: [
    'Improper pitch correction during banking.',
    'Improper power application, during roll in and roll out.',
    'Overbanking / Under-banking.',
    'Head inside the cockpit.'
  ],
  acs: {
    P: { Airspeed: '+/- 10 KIAS', Altitude: '+/- 100’', Heading: '+/- 10˚', Bank: '45˚ +/- 5˚' },
    C: { Airspeed: '+/- 10 KIAS', Altitude: '+/- 100’', Heading: '+/- 10˚', Bank: '50˚ +/- 5˚' }
  },
  acsNotes: ['Maintain coordination.', 'Airspeed not to exceed V<sub>A</sub>.']
},

{
  id: 'chandelles', name: 'Chandelles', cat: 'perf', page: '40–41',
  ref: 'AFH § 10-4, ACS Commercial / Flight Instructor.',
  levels: ['C','I'],
  desc: 'A chandelle is a maximum performance climbing turn beginning from approximately straight and level flight and ending at the completion of a 180˚ turn with wings level, and nose high attitude at minimum controllable airspeed. The maneuver requires that the maximum gain in altitude be obtained from the available power and bank.',
  obj: 'The purpose of a chandelle as a training maneuver is to develop the pilot’s coordination, orientation, planning and feel for an airplane at varying airspeeds and attitudes. It is performed at a manufacturer’s recommended speed or in its absence a speed no greater than V<sub>A</sub>.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Set the power to required rpm to achieve [VA].',
      'Before starting the maneuver select a prominent 90˚ reference point perpendicular to the current flight path.',
      'Roll the airplane into a coordinated 30˚ bank, then simultaneously add full power and begin a gradual pitch upward. The pitch should be timed to be gradual enough to reach the 90˚ point at the appropriate nose up pitch attitude, just below the critical angle of attack.',
      'Once at the 90˚ point the elevator pressure must continue to be increased so that the pitch remains at the established pitch in the first half of the maneuver. The airplane must begin the roll out toward the 180˚ point at such a rate as to arrive at the 180˚ point with zero bank angle, and at the minimum controllable airspeed.',
      'Upon reaching the 180˚ point, slowly lower the nose to maintain the altitude gained and accelerate the airplane back to the cruise speed.',
      'Resume cruise at the completion.'
    ]}
  ],
  notes: [],
  planning: [
    'Effect of airspeed on control effectiveness.',
    'Effects of wind on entry of maneuver.',
    'Effects of wind on the performance of the climbing turn.',
    'Pros and Cons for turning into and away from the wind.',
    'Rudder input for Right turn vs. Left turn.'
  ],
  faults: [
    'Improper pitch, bank, power coordination during entry or completion.',
    'Uncoordinated use of flight controls.',
    'Improper deviations from pitch and bank attitude.',
    'Failure to achieve maximum performance.'
  ],
  acs: {
    C: { Airspeed: 'Recommended entry airspeed per POH/AFM or maneuvering airspeed', Altitude: 'Performed no lower than 1,500’ AGL', Heading: '180˚ Point, +/- 10˚', Bank: 'Approximately 30˚' }
  },
  acsNotes: ['Complete rollout at the 180˚ point just above stall speed, maintaining that airspeed and momentarily avoiding a stall.']
},

{
  id: 'lazy-eight', name: 'Lazy Eight', cat: 'perf', page: '42–43',
  ref: 'AFH § 10-6, ACS Commercial / Flight Instructor.',
  levels: ['C','I'],
  desc: 'Consists of two 180˚ turns in opposite directions, while making a climb and descent in a symmetrical pattern during each of the turns.',
  obj: 'The objective of the lazy 8 as a training maneuver is to develop the pilot’s planning, orientation, coordination and feel for varying control forces while precisely maneuvering the airplane. It is performed at a manufacturer’s recommended speed or in its absence a speed no greater than V<sub>A</sub>.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Set the power to required rpm to achieve [VA].',
      'Select visual reference points at 45˚, 90˚, and 135˚.',
      'Enter the maneuver perpendicular to the wind. Abeam the 90˚ reference point, smoothly raise the nose of the airplane and then begin a gradual bank toward the 45˚ point. A gradual input of rudder will be required as p-factor increases.',
      'At the 45˚ point the airplane will be at its highest pitch attitude of approximately 10˚–12˚ nose up and a bank angle of approximately 15˚.',
      'Upon reaching the 45˚ point the elevator back pressure should be relaxed slightly to allow the nose of the aircraft to move down to zero pitch attitude through the 90˚ point. The bank angle will be increasing to a maximum of 30˚ by the 90˚ point and any back pressure needs to be released.',
      'The aircraft will pass (slice the horizon) the 90˚ point turning towards the 135˚ point. Bank angle needs to be smoothly reduced from 30˚ to 15˚. At the 135˚ point the airplane will be at its maximum pitch downward (approx. 7˚), with the airspeed increasing and the bank angle will have decreased to approximately 15˚.',
      'From the 135˚ point to the 180˚ point, planning and timing of the airplane’s pitch attitude which will be increasing and the bank angle which will be decreasing to allow the airplane to finish the first half of the maneuver at the same altitude and airspeed that it began.',
      'Without any pause between turns, repeat steps 1 through 5 until both halves are complete.',
      'Only one eight should be performed.',
      'Resume cruise at the completion of the second 180˚ portion of the maneuver.'
    ]}
  ],
  notes: [
    'TECHNIQUE CONSIDERATION: As an aid to the maneuver, it is recommended that the pilot select several reference points — one straight off the nose, one at 45˚, one at 90˚, one at 135˚ and finally one at 180˚. The 90˚ point must be selected from the direction of a perpendicular wind (i.e. the airplane must turn into the wind towards the 90˚ point). This wind consideration is not an ACS or Airplane Flying Handbook requirement, however doing so assists with uniform/equal performance during the maneuver, especially in strong winds.'
  ],
  planning: ['Effect of airspeed on control effectiveness.', 'Effects of wind on entry of maneuver.'],
  faults: [
    'Improper pitch, bank, power coordination during entry or completion.',
    'Uncoordinated use of flight controls.',
    'Improper deviations from pitch and bank attitude.',
    'Failure to achieve maximum performance.'
  ],
  acs: {
    C: { Airspeed: '180˚ Points, +/- 10 KIAS', Altitude: '180˚ Points, +/- 100’', Heading: '180˚ Points, +/- 10˚', Bank: 'Approximately 30˚ at steepest point' }
  },
  acsNotes: ['Performed no lower than 1,500’ AGL.', 'Maintain coordination.']
},

{
  id: 'steep-spiral', name: 'Steep Spiral', cat: 'perf', page: '44–45',
  ref: 'AFH § 10-3, ACS Commercial / Flight Instructor.',
  levels: ['C','I'],
  desc: 'A steep spiral is a descending constant gliding turn, during which a constant radius around a point on the ground is maintained, while the steepest angle of bank does not exceed 60˚. Constant airspeed is maintained throughout.',
  obj: 'To improve a pilot’s ability for airspeed control, wind drift control, planning, orientation, division of attention relative to an engine failure or procedure for dissipating altitude.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Establish the airplane in cruise flight at an altitude not less than 3000’ AGL. Select a suitable ground reference point, crossed roads make excellent points.',
      'Having established the wind direction, turn the airplane into the wind, reduce the power. Reduce the airspeed to the speed required for best glide, use power and trim to maintain altitude and airspeed.',
      'Approximately ¼ mile from the reference point, reduce the power to idle and allow the airplane to descend at best glide speed. Trim.',
      'Abeam the reference point, smoothly roll the airplane into a coordinated steep banked turn. A constant radius is required. As the turn progresses, the bank will increase as the wind shifts to a tail wind. Smooth elevator changes are required to maintain the best glide speed.',
      'On passing the original entry point apply full power to clear the engine.',
      'Perform three full turns. At the discretion of the instructor the maneuver may be continued to a simulated forced landing, or the power may be applied to return the airplane to cruise.'
    ]}
  ],
  notes: [
    'During a steep spiral, the only constant is ground speed. Clearing the engine at the original 360˚ entry point (headwind) assures no increase in ground speed, regains heat in the cylinders to prevent cold shock when power is applied for cruise.'
  ],
  planning: [
    'Relationship of bank angle and pitch to maintain given airspeed.',
    'Relationship of airspeed to radius of turn.',
    'Engine should be cleared by briefly advancing throttle to normal cruising power.',
    'Suggested radius of turns is ¼ mile from the reference point.'
  ],
  faults: [
    'Failure to establish glide speed.',
    'Failure to enter in the wind.',
    'Failure to maintain glide speed.',
    'Failure to correct for wind.',
    'Failure to maintain bank control.',
    'Failure to clear engine.'
  ],
  acs: {
    C: { Airspeed: 'Establish appropriate glide speed +/- 10 KIAS', Altitude: 'One sufficient to continue through a series of at least three, 360˚ turns', Heading: 'Rollout on specified heading +/- 10˚', Bank: 'Establish and maintain steep spiral, not to exceed 60˚ of bank' }
  },
  acsNotes: [
    'Maintain coordination.',
    'Maintain constant radius about a suitable ground reference point.',
    'Complete the maneuver no lower than 1,500’ AGL.'
  ]
},

{
  id: 'vertical-s', name: 'Vertical S Maneuvers', cat: 'perf', page: '46–49',
  ref: 'SEL Guide pp. 46–49 (no ACS table published for this maneuver).',
  levels: ['C','I'],
  desc: 'This maneuver is a continuous series of rate climbs and descents flown on a constant heading utilizing a vertical velocity compatible with aircraft performance.',
  obj: 'To develop coordination in power, pitch attitude, and bank attitude control. These maneuvers will also help increase speed in cross-checking instruments.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Reduce RPM and slow to [VCC]. Set pitch and power then trim to maintain straight and level.',
      'Enter a climb from an exact altitude with power only based on the power table.',
      'Advance the power to the approximate setting that will result in a 500 foot per minute rate of climb, simultaneously control pressure to maintain a constant airspeed. After stabilized in the climb, trim should hold the airspeed within a few knots.',
      'As the power is advanced in the climb entry, the airspeed indicator becomes primary for pitch and remains so until the vertical speed stabilizes at a rate of climb of 500 per minute. Adjust power accordingly.',
      'Once stabilized in the climb, the vertical speed indicator becomes primary for power and remains so for the remainder of the climb. The airspeed indicator remains the primary instrument for pitch.',
      'The heading indicator is primary for bank throughout the maneuver.',
      'Show that any deviation in vertical speed indicates the need for a pitch change and that the airspeed is controlled by power.',
      'Show how pitch and power changes must be coordinated closely.',
      'Emphasize the correlation between trim with airspeed and power with rate throughout.',
      'At 500 feet above starting altitude begin your descent back to entry altitude at a constant rate of 500 ft/min.',
      'Upon reaching entry altitude, initiate a climb at 500 ft/min up to 400 feet above starting altitude and then descend at 500 ft/min back to starting altitude.',
      'Repeat constant rate climbs and descents for 300 feet and 200 feet above starting altitude.'
    ]},
    { name: 'DESCENTS AT A DEFINITE (CONSTANT) RATE', steps: [
      'Enter a descent from an exact altitude and descending airspeed with power only.',
      'Reduce power to the approximate setting for a 500 foot per minute rate of descent.',
      'Simultaneously adjust pitch attitude to maintain constant airspeed. Once established, trim should hold airspeed within a few knots.',
      'As the power is reduced in the descent entry, the airspeed indicator is primary for pitch and remains so until the vertical speed is established at a rate of descent of 500 feet per minute.',
      'Now the vertical speed indicator becomes primary for pitch and remains so for the remainder of the descent.',
      'Once the vertical speed is established at 500 feet per minute, the airspeed indicator becomes the primary instrument for power.',
      'The heading indicator is primary for bank throughout the maneuver.',
      'Show how pitch and power changes must be coordinated.',
      'Emphasize the correlation between trim with airspeed and power with rate throughout.'
    ]}
  ],
  notes: [
    'Pitch/power troubleshooting: if the vertical speed is correct but the airspeed is high, reduce the power. If the vertical is high and the airspeed is low, reduce pitch. If the vertical speed is low and the airspeed is low, increase both pitch and power. If the vertical speed is high and the airspeed is high, reduce both pitch and power.',
    'Level off from a climb at a definite (constant) rate: plan to smoothly adjust power back to initial starting power at 10% of the rate of climb. Ensure altitude and airspeed have been achieved and are maintained, then trim as necessary.',
    'Calibration of the VSI: establish a climb or descent at a 500 foot per minute indicated rate. Each 15 seconds check the altimeter for a 125 feet altitude change. If the altitude change is more or less than 125 feet adjust the vertical speed accordingly. Repeat until a vertical speed is determined that will produce the desired rate.',
    'VERTICAL S₁ MODIFICATION: a combination of the vertical S and a standard rate turn. Enter in the same manner as a climbing or descending turn. Reverse the direction of turn with each return to entry altitude.',
    'VERTICAL S₂ MODIFICATION: differs from the vertical S-1 in that the direction of turn is reversed with each reversal of vertical direction.',
    'SAW TOOTH MODIFICATION: like the Standard Vertical S but a period of level flight is incorporated at the top of climb and bottom of descent.'
  ],
  planning: [
    'Cross check, instrument interpretation and aircraft control.',
    'Primary/supporting vs. control/performance methods.',
    'Make climbs and descents at a definite (constant) rate.',
    'During the reversal of vertical direction, lead the altitude by 10% of rate.'
  ],
  faults: [],
  acs: {}, acsNotes: []
},

/* ===================== GROUND REFERENCE ===================== */
{
  id: 'rectangular-course', name: 'Rectangular Course', cat: 'ground', page: '51–52',
  ref: 'AFH § 7-5, ACS Private / Flight Instructor.',
  levels: ['P','I'],
  desc: 'A maneuver in which the ground track of the airplane is equidistant from all sides of a selected rectangular area on the ground.',
  obj: 'To develop the skills required to fly a uniform traffic pattern while compensating for the effects of wind.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Select a ground reference point clear of obstacles.',
      'Determine the wind directions.',
      'Enter the maneuver with a direct tail wind, altitude 600’ to 1000’ AGL.',
      'Set power to required rpm to maintain a constant airspeed slightly below [VA].',
      'Enter on a 45° for the downwind paralleling the outer limits of the rectangular course.',
      'Abeam the base leg reference point, begin a coordinated turn to the base, this will be the steepest turn and will have to be greater than 90˚ of turn to establish the appropriate wind correction.',
      'Once abeam the upwind reference point, begin a coordinated turn. The bank will be shallower than the previous turn, but not the shallowest. As the upwind leg is directly into the wind, no crab angle will be needed. Continue until abeam the crosswind leg reference point.',
      'Once abeam the crosswind reference point, begin a coordinated turn to the crosswind leg. This will be the shallowest bank angle — the turn will be less than 90˚ as the wind is now a direct crosswind.',
      'Continue the crosswind leg until abeam the downwind reference point. Once abeam begin a coordinated turn to the downwind leg. This bank will begin shallow and steepen as the turn progresses. The turn will be greater than 90˚.'
    ]},
    { name: 'EXITING THE MANEUVER', steps: [
      'Maintain the downwind track and exit when abeam the base reference point.'
    ]}
  ],
  notes: [
    'CRAB ANGLES: to maintain a straight track, the airplane must be turned into the wind; the amount of crab angle will be dependent on the amount of wind during each segment of the pattern.',
    'VARYING BANK ANGLES: using different bank angles to maintain a constant distance from the selected reference line. At no time should the bank angle during the maneuver exceed 45˚.',
    'CONSTANT ALTITUDE AND AIRSPEED: constant altitude and airspeed are also requirements of this maneuver, therefore constant division of attention is essential.'
  ],
  planning: [
    'Noise abatement.',
    'Obstruction or obstacle clearance.',
    'Emergency landing area.',
    'Configuration and airspeed.',
    'Selection of a suitable reference area and its orientation to the wind.',
    'Correlation to airport pattern operations.'
  ],
  faults: [
    'Failure to maintain a ground track that is equidistant of the reference area.',
    'Failure to maintain altitude and airspeed.',
    'Uncoordinated flight controls.'
  ],
  acs: {
    P: { Airspeed: '+/- 10 KIAS', Altitude: 'Between 600’ & 1000’ AGL, +/- 100’', Heading: 'Required wind drift corrections to maintain constant ground track around the reference area', Bank: 'NA' }
  },
  acsNotes: ['Enter left or right pattern at appropriate distance 45˚ to the downwind leg.', 'Maintain coordination.']
},

{
  id: 'turns-around-point', name: 'Turns Around a Point', cat: 'ground', page: '53–54',
  ref: 'AFH § 7-7, ACS Private / Flight Instructor.',
  levels: ['P','I'],
  desc: 'The maneuver requires at least one 360˚ turn around a reference point on the ground.',
  obj: 'To develop the pilot’s division of attention between the flight path and ground references and recognition of drift towards or away from a prominent ground reference point while maintaining a constant altitude.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Select a ground reference point clear of obstacles.',
      'Enter the maneuver with a direct tail wind, altitude 600’ to 1000’ AGL.',
      'Set power to required rpm to maintain a constant airspeed slightly below [VA].',
      'Enter on the downwind on either side of the reference point, distance of about ½ mile radius.',
      'Abeam your point, bank the airplane (not to exceed 45˚ of bank) towards the reference point and begin a constant radius turn. This will be the steepest angle of bank as this is the leg with the highest ground speed.',
      'Continue to fly a smooth circular ground track gradually reducing the angle of bank as the turn progresses into the wind, reducing the ground speed, to maintain an equidistant track around the ground reference point. Divide attention between traffic, the reference point and the engine and flight instruments.'
    ]},
    { name: 'EXITING THE MANEUVER', steps: [
      'After the completion of at least one 360˚ turn exit on the same heading as the entry.'
    ]}
  ],
  notes: [
    'VARYING BANK ANGLES: planning ahead using different bank angles in order to maintain a constant radius around the selected reference point. At no time throughout the maneuver should the bank angle exceed 45˚.',
    'CONSTANT ALTITUDE AND AIRSPEED: a constant altitude and airspeed are also requirements of this maneuver therefore constant division of attention between looking for traffic, the reference point, coordination, and a constant brief monitoring of the flight instruments is essential.'
  ],
  planning: [
    'Noise abatement.',
    'Obstruction or obstacle clearance.',
    'Emergency landing area.',
    'Configuration and airspeed.',
    'Selection of a suitable reference area and its orientation to the wind.'
  ],
  faults: [
    'Inability to have airplane maintain proper ground track by correcting for wind.',
    'Failure to maintain altitude and airspeed.',
    'Uncoordinated flight controls.'
  ],
  acs: {
    P: { Airspeed: '+/- 10 KIAS', Altitude: 'Between 600’ & 1000’ AGL, +/- 100’', Heading: 'NA', Bank: 'One that allows a constant radius turn on each side of the point' }
  },
  acsNotes: ['Maintain coordination.']
},

{
  id: 's-turns', name: 'S-Turns Across a Road', cat: 'ground', page: '55–56',
  ref: 'AFH § 7-8, ACS Private / Flight Instructor.',
  levels: ['P','I'],
  desc: 'The maneuver requires a series of 180˚ turns of equal radii in opposite directions.',
  obj: 'To develop the pilot’s ability to compensate for drift and ground speed changes during turns, to orientate the flight path with ground references and divide the pilot’s attention.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Select a ground reference point clear of obstacles.',
      'Enter the maneuver with a direct tail wind, altitude 600’ to 1000’ AGL.',
      'Set power to required rpm to maintain a constant airspeed slightly below [VA].',
      'As the aircraft crosses the road roll into a coordinated turn not to exceed 45˚ of bank towards the reference point and begin a constant radius turn. This will be the steepest angle of bank as this is the leg with the highest ground speed.',
      'Continue to fly a smooth semicircular ground track reducing the angle of bank to roll wings level over the road reference point.',
      'Once the first half of the “S” is complete immediately roll the aircraft into a coordinated turn in the opposite direction. This turn will be the shallowest angle of bank as this leg will have the slowest ground speed.',
      'Continue to fly a smooth semicircular ground track reducing the angle of bank to roll wings level over the road reference point. Continue the maneuver in both directions up and down the reference line.'
    ]},
    { name: 'EXITING THE MANEUVER', steps: [
      'After two half circles maintain wings level over the reference line and exit on the downwind.'
    ]}
  ],
  notes: [
    'VARYING BANK ANGLES: planning ahead using different bank angles in order to maintain a constant distance from the selected reference line. At no time should the bank angle during the maneuver exceed 45˚.',
    'CONSTANT ALTITUDE AND AIRSPEED: before starting the maneuver, the pre-maneuver flow check and clearing turns must be completed.'
  ],
  planning: [
    'Noise abatement.',
    'Obstruction or obstacle clearance.',
    'Emergency landing area.',
    'Configuration and airspeed.',
    'Selection of a suitable reference area and its orientation to the wind.'
  ],
  faults: [
    'Inability to have airplane cross perpendicular to reference line.',
    'Semicircles of unequal radius on either side of selected reference.',
    'Failure to maintain altitude and airspeed.',
    'Uncoordinated flight controls.'
  ],
  acs: {
    P: { Airspeed: '+/- 10 KIAS', Altitude: 'Between 600’ & 1000’ AGL, +/- 100’', Heading: 'NA', Bank: 'One that allows a constant radius turn on each side of the reference line' }
  },
  acsNotes: ['Maintain coordination.']
},

{
  id: 'eights-on-pylons', name: 'Eights on Pylons', cat: 'ground', page: '57–58',
  ref: 'AFH § 7-13, ACS Commercial / Flight Instructor.',
  levels: ['C','I'],
  desc: 'This maneuver requires the airplane to be flown in a circular pattern in alternate directions in the form of an eight pivoting over two previously selected pylons. No attempt is made to maintain a uniform distance from the pylons. The airplane is flown at such an altitude and airspeed that a line parallel to the airplane’s lateral axis and extending from the pilot’s eye appears to pivot on each of the pylons.',
  obj: 'To develop the ability to maneuver the airplane accurately while dividing attention between the flight path and selected pylons on the ground.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Set power to required rpm to maintain a constant airspeed slightly below [VA].',
      'Select a suitable area clear of obstacles to perform the maneuver with two reference points approximately ½ mile apart, perpendicular to the wind. As a rule of thumb fly 15 seconds from pylon to pylon — this will give a good distance between them.',
      'Enter the maneuver at a 45˚ to the downwind, at the calculated pivotal altitude.',
      'As the aircraft wing tip crosses the pylon roll into a coordinated turn and rest the wing tip on the pylon.',
      'Continue to fly a smooth circular pattern. As the airplane begins to enter into the wind, the ground speed will reduce causing the pivot reference point to move forward therefore requiring the pilot to release pressure on the yoke to maintain the pivot. As the altitude becomes less the bank angle will need to be reduced also.',
      'As the wind becomes more of a crosswind it is going to push the airplane into the pylon — this will require an increase in bank angle to remain pivoting.',
      'As the airplane continues around the turn the wind will increase the ground speed, moving the pivot reference point rearward requiring the pilot to increase back pressure on the yoke to remain pivoting. As the altitude increases, the angle of bank will also increase.',
      'Continue the turn for approximately 270˚ until 45˚ downwind. The airplane should be at the same altitude and airspeed as when the maneuver was started. At this point smoothly roll the wings level and track at a 45˚ angle to the next pylon. There is no time requirement between pylons though 5 seconds is usually enough before beginning the next turn.',
      'When abeam the next pylon, repeat as with the first turn.'
    ]},
    { name: 'EXITING THE MANEUVER', steps: [
      'After completing the eight, exit on the original entry heading.'
    ]}
  ],
  notes: [
    'PIVOTAL ALTITUDE: a rule of thumb for estimating pivotal altitude is to divide the GS² by 11.3 (knots).',
    'Pressing bottom rudder (skid) in the turn will yaw the airplane’s nose to the inside of the turn and will appear to move the reference point ahead of the wing. Pressing top rudder (slip) in the turn will yaw the airplane’s nose to the outside of the turn and will appear to move the reference point behind the wing. The rudder is to be used to maintain coordination only.'
  ],
  planning: [
    'Noise abatement.',
    'Obstruction or obstacle clearance.',
    'Emergency landing area.',
    'Configuration and airspeed.',
    'Selection of a suitable reference area and its orientation to the wind.',
    'Selection of suitable altitude.'
  ],
  faults: [
    'Inability to have airplane maintain proper ground track by correcting for wind.',
    'Uncoordinated flight controls.',
    'Use of rudder to maintain position on pylon.'
  ],
  acs: {
    C: { Airspeed: 'Appropriate airspeed', Altitude: 'At pivotal altitude between pylons and required to maintain a constant line-of-sight reference from the pylon', Heading: 'NA', Bank: 'Not to exceed 40˚' }
  },
  acsNotes: [
    'Determine pivotal altitude prior to entry.',
    'Maintain coordination.',
    'Maintain pylon position using appropriate pivotal altitude, avoid slips and skids.'
  ]
},

/* ===================== LANDINGS ===================== */
{
  id: 'normal-landing', name: 'Normal & Crosswind Landing', cat: 'landing', page: '60–62',
  ref: 'AFH § 9-2 and 9-15, ACS Private / Commercial / Flight Instructor.',
  levels: ['P','C','I'],
  desc: 'The common landing procedure when runway length and surface are appropriate, no obstacles restrict the approach path.',
  obj: 'Develop the pilot’s proficiency on normal and crosswind landings.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Prior to midfield downwind, a before landing flow and checklist should be completed.',
      'Abeam the desired touchdown point, reduce power to approach setting.',
      'Extend flaps (10 degrees or T/O) then set pitch attitude for desired sink rate according to pattern size, ideally resulting in downwind airspeed, and about 500 fpm descent. Trim as required. Complete GUMPS Check.',
      'Turn base leg approximately 45˚ from touchdown point. Extend the flaps to 20 degrees. The target airspeed for base should be achieved by adjusting pitch accordingly. Trim as required. Clear final approach.',
      'Plan the turn to final based on winds and traffic. After turning onto final approach, flaps full, pitch for proper [VAPP] airspeed, power to maintain proper glide path. Trim as required.',
      'GUMPS Check (Final Flow). If Retractable Gear: Verify and Announce, “3 Green, No Red,” (if not already done with landing clearance acknowledgement).',
      'Use ailerons to keep the aircraft flying over centerline. Use the rudder to align the nose of the aircraft down the centerline.',
      'Upon arrival in ground effect the throttle should be smoothly reduced to idle and increase back pressure, allowing the aircraft to settle onto the runway at the minimum controllable airspeed in a nose high attitude (flare).',
      'After touchdown, apply increased crosswind correction as necessary.',
      'Avoid heavy use of the brakes on the landing roll out.',
      'Taxi off the runway, complete after landing checklist.'
    ]}
  ],
  notes: ['It is not a primary concern to raise flaps immediately after touchdown. Focus should be on maintaining directional control and slowing the aircraft down in a safe manner.'],
  planning: [
    'Runway length, width, surface condition.',
    'Effects of high-density altitude and landing distance required.',
    'Consideration of obstructions or hazards.',
    'Landing performance data and limitations.',
    'Effect of flaps on approach and landing.',
    'Anticipate the effect of wind drift, yaw, necessary control inputs.',
    'Wind shear and wake turbulence considerations.',
    'Timely execution of go-around if necessary.'
  ],
  faults: [
    'Inappropriate removal of hand on throttle.',
    'Improper pitch and attitude control during round out and touchdown.',
    'Excessive airspeed that results in floating before touchdown.',
    'Failure to compensate for wind drift throughout landing.'
  ],
  acs: {
    P: { Airspeed: 'Manufacturer’s published speed or not more than 1.3 V<sub>SO</sub> + 10/-5 KIAS', Altitude: 'NA', Heading: 'Maintain directional control' },
    C: { Airspeed: 'Manufacturer’s published speed or not more than 1.3 V<sub>SO</sub> +/- 5 KIAS',   Altitude: 'NA', Heading: 'Maintain directional control' }
  },
  acsNotes: [
    'Private: touchdown within 400’ beyond or on the specified point. Commercial: touchdown within 200’ beyond or on the specified point.',
    'Touchdown with no side drift, minimum float, and airplane longitudinal axis aligned with/over runway centerline.',
    'Execute a timely go-around if the above tolerances cannot be made or for any other unsafe condition.',
    'Complete appropriate checklist(s).',
    'Crosswind landing: apply appropriate x-wind correction.'
  ]
},

{
  id: 'soft-field-landing', name: 'Soft Field Landing', cat: 'landing', page: '63–64',
  ref: 'AFH § 9-23, ACS Private / Commercial / Flight Instructor.',
  levels: ['P','C','I'],
  desc: 'Approach and landing to soft fields require the use of operational techniques in a manner that the wings support the weight of the airplane as long as practical, to minimize drag and stress imposed on the landing gear.',
  obj: 'To develop the pilot’s ability to obtain maximum performance from the airplane while performing a soft field landing.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Prior to midfield downwind, a before landing flow and checklist should be completed.',
      'Abeam the desired touchdown point, reduce power to approach setting.',
      'Extend flaps (10 degrees or T/O) then set pitch attitude for desired sink rate according to pattern size, ideally resulting in downwind airspeed, and about 500 fpm descent. Trim as required. GUMPS Check.',
      'Turn base leg approximately 45˚ from touchdown point. Extend the flaps to 20 degrees. The target airspeed for base should be achieved by adjusting pitch accordingly. Trim as required. Clear final approach.',
      'Plan the turn to final based on winds and traffic. After turning onto final approach, flaps full, airspeed should reference soft field approach speed. Pitch for proper airspeed, power to maintain proper glide path. Trim as required.',
      'GUMPS Check (Final Flow). For retractable gear, Verify and Announce “3 Green, No Red.”',
      'Use ailerons to keep the aircraft flying over centerline. Use the rudder to align the nose of the aircraft down the centerline.',
      'Upon arrival in ground effect the throttle should be smoothly reduced, and back pressure applied to bring the aircraft in a nose up attitude.',
      'Just prior to touchdown, ensure that the power is just above idle by approximately 100-200 RPM to increase the tail down force and hold the airplane nose off the runway. The aircraft must settle onto the runway at the minimum controllable airspeed, as softly as possible and the nose must remain clear of the soft surface.',
      'Hold full back elevator pressure on the landing roll out and bring the throttle to idle. Do not use brakes until off runway if possible.',
      'Taxi off the runway, complete after landing checklist.'
    ]}
  ],
  notes: [],
  planning: [
    'Runway length, width, surface condition.',
    'Effect of high-density altitude and landing distance required.',
    'Consideration of obstructions or hazards.',
    'Landing performance data and limitations.',
    'Effect of flaps on approach and landing.',
    'Anticipate the effect of wind drift, yaw, necessary control inputs.',
    'Wind shear and wake turbulence considerations.',
    'Timely execution of go-around if necessary.'
  ],
  faults: [
    'Inappropriate removal of hand on throttle.',
    'Improper pitch and attitude control during round out and touchdown.',
    'Excessive airspeed that results in floating before touchdown.',
    'Failure to compensate for wind drift throughout landing.'
  ],
  acs: {
    P: { Airspeed: 'Published approach speed or not more than 1.3 V<sub>SO</sub> + 10/-5 KIAS (with gust factor)', Altitude: 'NA', Heading: 'Maintain directional control, aircraft aligned with runway center/landing path' },
    C: { Airspeed: 'Published approach speed or not more than 1.3 V<sub>SO</sub> +/- 5 KIAS (with gust factor)',   Altitude: 'NA', Heading: 'Maintain directional control, aircraft aligned with runway center/landing path' }
  },
  acsNotes: ['Touchdown smoothly with minimum sink rate, no side drift.', 'Apply appropriate x-wind correction.']
},

{
  id: 'short-field-landing', name: 'Short Field Approach and Landing', cat: 'landing', page: '65–66',
  ref: 'AFH § 9-20, ACS Private / Commercial / Flight Instructor.',
  levels: ['P','C','I'],
  desc: 'Short field approaches and landings to fields where the landing area is short or restricted by obstructions requires that the airplane be flown at the limit of its landing performance capabilities.',
  obj: 'To develop the pilot’s ability to obtain maximum performance from the airplane while performing a short field landing and clearing all obstacles in the approach path.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Prior to midfield downwind, a before landing flow and checklist should be completed.',
      'Abeam the desired touchdown point, reduce power to approach setting.',
      'Extend flaps (10 degrees or T/O) then set pitch attitude for desired sink rate according to pattern size, ideally resulting in downwind airspeed, and about 500 fpm descent. Trim as required. GUMPS Check.',
      'Turn base leg approximately 45˚ from touchdown point. Extend the flaps to 20 degrees. The target airspeed for base should be achieved by adjusting pitch accordingly. Trim as required. Clear final approach.',
      'Plan the turn to final based on winds and traffic. After turning onto final approach, flaps full, airspeed should reference short field approach speed. Pitch for proper airspeed, power to maintain proper glide path. Trim as required.',
      'GUMPS Check (Final Flow). For retractable gear, Verify and Announce “3 Green, No Red.”',
      'Use ailerons to keep the aircraft flying over the centerline. Use the rudder to align the nose of the aircraft down the centerline.',
      'On short final, reduce throttle to increase descent rate and steepen approach path. Simultaneously reduce back pressure to maintain short field approach speed.',
      'Aim for a spot just before your touchdown point and use ground effect to carry the aircraft the remaining distance.',
      'Once all wheels are on the runway, apply maximum braking while applying full back pressure on yoke. (SIMULATE MAX BRAKING)',
      'Taxi off the runway, complete after landing checklist.'
    ]}
  ],
  notes: ['It is not a primary concern to raise flaps immediately after touchdown. Focus should be on maintaining directional control and slowing the aircraft down in a safe manner.'],
  planning: [
    'Runway length, width, surface condition.',
    'Effect of high-density altitude and landing distance required.',
    'Consideration of obstructions or hazards.',
    'Landing performance data and limitations.',
    'Effect of flaps on approach and landing.',
    'Anticipate the effect of wind drift, yaw, necessary control inputs.',
    'Wind shear and wake turbulence considerations.',
    'Timely execution of go-around if necessary.'
  ],
  faults: [
    'Inappropriate removal of hand on throttle.',
    'Improper pitch and attitude control during round out and touchdown.',
    'Excessive airspeed that results in floating before touchdown.',
    'Failure to compensate for wind drift throughout landing.',
    'Excessive braking.'
  ],
  acs: {
    P: { Airspeed: 'Not more than 1.3 V<sub>SO</sub> + 10/-5 KIAS', Altitude: 'NA', Heading: 'Maintain directional control, and airplane longitudinal axis aligned with/over runway centerline' },
    C: { Airspeed: 'Not more than 1.3 V<sub>SO</sub> +/- 5 KIAS',   Altitude: 'NA', Heading: 'Maintain directional control, and airplane longitudinal axis aligned with/over runway centerline' }
  },
  acsNotes: [
    'Private: touchdown within 200’ beyond or on the specified point, threshold markings, or runway numbers. Commercial: touchdown within 100’ beyond or on the specified point, threshold markings, or runway numbers.',
    'Touchdown with no side drift, minimum float.',
    'Apply appropriate x-wind correction.',
    'Complete appropriate checklist(s).'
  ]
},

{
  id: 'flapless-landing', name: 'Flapless Landing', cat: 'landing', page: '67–68',
  ref: 'POH/AFM (if applicable).',
  levels: ['P','C','I'],
  desc: 'This maneuver simulates an approach to landing with a flap failure. This could prove useful in making an emergency landing if an electrical failure occurs.',
  obj: 'Develop the pilot’s ability to maneuver the airplane without flaps during an approach and maintain positive control of the aircraft from flare to touchdown.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Prior to midfield downwind, a before landing flow and checklist should be completed.',
      'Abeam the desired touchdown point, reduce power to approach setting.',
      'Set pitch attitude for desired sink rate according to pattern size, ideally resulting in downwind airspeed, and about 500 fpm descent. Trim as required. GUMPS Check.',
      'Turn base leg approximately 45˚ from touchdown point. The target airspeed for base should be achieved by adjusting pitch accordingly. Trim as required. Clear final approach.',
      'Plan the turn to final based on winds and traffic. After turning onto final approach, pitch for proper [VAPP] airspeed for a no flap landing, power to maintain proper glide path. Trim as required.',
      'GUMPS Check (Final Flow). If Retractable Gear: Verify and Announce, “3 Green, No Red,” (if not already done with landing clearance acknowledgement).',
      'Use ailerons to keep the aircraft flying over centerline. Use the rudder to align the nose of the aircraft down the centerline.',
      'Upon arrival in ground effect the throttle should be smoothly reduced to idle and increase back pressure, allowing the aircraft to settle onto the runway at the minimum controllable airspeed in a nose high attitude.',
      'After touchdown, apply increased crosswind correction as necessary.',
      'Avoid heavy use of the brakes on the landing roll out.',
      'Taxi off the runway, complete after landing checklist.'
    ]}
  ],
  notes: ['V<sub>APP</sub> for flapless landing is faster than V<sub>APP</sub> for landing with full flaps. Consult POH for proper V speeds.'],
  planning: [
    'Runway length, width, surface condition.',
    'Effect of high-density altitude and landing distance required.',
    'Effect of 0˚ flaps on approach and landing.',
    'Effect of floating in ground effect.',
    'Wind shear and wake turbulence considerations.'
  ],
  faults: [
    'Inappropriate removal of hand on throttle.',
    'Improper pitch and attitude control during round out and touchdown.',
    'Excessive airspeed that results in floating before touchdown.',
    'Failure to compensate for wind drift throughout landing.'
  ],
  acs: {
    P: { Airspeed: 'Not more than 1.3 V<sub>SO</sub> + 10/-5 KIAS', Altitude: 'NA', Heading: 'Maintain Directional Control' },
    C: { Airspeed: 'Not more than 1.3 V<sub>SO</sub> +/- 5 KIAS',   Altitude: 'NA', Heading: 'Maintain Directional Control' }
  },
  acsNotes: ['Touchdown smoothly.', 'Apply appropriate x-wind correction.', 'Complete appropriate checklist(s).']
},

{
  id: 'forward-slip', name: 'Forward Slip to a Landing', cat: 'landing', page: '69–70',
  ref: 'AFH § 9-15, ACS Private / Commercial / Flight Instructor.',
  levels: ['P','C','I'],
  desc: 'This maneuver allows the pilot to increase the descent angle of the aircraft without increasing airspeed. This could prove useful in making an emergency landing or in landing in an area with obstructions.',
  obj: 'To develop skills necessary to perform emergency approaches or to use a high approach path to clear obstacles.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Prior to midfield downwind, a before landing flow and checklist should be completed.',
      'Abeam the desired touchdown point, reduce power to approach setting.',
      'Set pitch attitude, and flaps (as required), for desired sink rate according to pattern size, ideally resulting in downwind airspeed, and about 500 fpm descent. Trim as required. GUMPS Check.',
      'Turn base leg early so as to maintain a higher altitude from touchdown point. The target airspeeds should be achieved by adjusting pitch. Trim as required.',
      'Plan the turn to final based on winds and traffic. After turning onto final approach, pitch for proper [VAPP] airspeed for a no flap landing, power to maintain a higher than normal glide path. Trim as required.',
      'Once properly established, reduce power to idle.',
      'Aileron into the wind, if applicable, and use the rudder to offset the longitudinal axis from centerline. Forward pressure to keep [VAPP] or greater on airspeed.',
      'Once the appropriate glide path is attained or ground effect is reached, moderately release control inputs and continue with a normal, short, or soft field landing.',
      'Hold full back elevator pressure on the landing roll out.',
      'Avoid heavy use of the brakes on the landing roll out.',
      'Taxi off the runway, complete after landing checklist.'
    ]}
  ],
  notes: ['Slips can either be done with or without flaps depending on the make and model of aircraft flown. It is not a primary concern to raise flaps immediately after touchdown. Focus should be on maintaining directional control and slowing the aircraft down in a safe manner.'],
  planning: [
    'Runway length, width, surface condition.',
    'Consideration of obstructions or hazards.',
    'Effect of flaps on approach.',
    'Anticipate the effect of wind drift, yaw, necessary control inputs.',
    'Wind shear and wake turbulence considerations.',
    'Timely execution of go-around if necessary.'
  ],
  faults: [
    'Inappropriate removal of hand on throttle.',
    'Improper pitch and attitude control during round out and touchdown.',
    'Excessive airspeed that results in tail stress.',
    'Failure to slip into the wind, rather away.',
    'Failure to use full rudder deflection.'
  ],
  acs: {
    P: { Airspeed: 'Appropriately configured' }
  },
  acsNotes: [
    'Plan and follow a flight path to the selected landing area considering altitude, wind, terrain, and obstructions.',
    'Maintain ground track aligned with runway center/landing path.',
    'As necessary, correlate crosswind with direction of forward slip and transition to side slip before touchdown.',
    'Touchdown within 400’ of specified point.',
    'Complete appropriate checklist(s).'
  ]
},

{
  id: 'power-off-180', name: 'Power-Off 180˚', cat: 'landing', page: '71–72',
  ref: 'AFH § 9-26, ACS Commercial / Flight Instructor.',
  levels: ['C','I'],
  desc: 'A power off approach and landing made by gliding with the engine idling, through a 180˚ accuracy approach to a touchdown at or within 200’ beyond the specified touchdown point.',
  obj: 'To develop the pilot’s skills and judgment necessary for accurately flying the airplane, without power, to a safe landing.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Prior to midfield downwind, a before landing flow and checklist should be completed.',
      'Abeam the desired touchdown point, reduce power to idle.',
      'Establish best glide airspeed [VG], while maintaining altitude. Trim as required. GUMPS Check.',
      'The approach path may be varied by positioning the base leg closer to or further from the approach end of the runway according to wind conditions.',
      'The turn from downwind leg to the base leg should be uniform and bank angle determined by wind. Flaps as desired.',
      'The base to final turn should be planned and accomplished so that upon rolling out of the turn the airplane will be aligned with the centerline of the runway. Flaps as desired.',
      'If Retractable Gear: GUMPS Check (Final Flow), Verify and Announce “3 Green, No Red.”',
      'Aim for a spot just before your touchdown point and use ground effect to carry the aircraft the remaining distance.',
      'Upon arrival in ground effect verify throttle is idle and increase back pressure, allowing the aircraft to settle onto the runway at the minimum controllable airspeed in a nose high attitude.',
      'Hold full back elevator pressure on the landing roll out.',
      'Avoid heavy use of the brakes on the landing roll out.',
      'Taxi off the runway, complete after landing checklist.'
    ]}
  ],
  notes: ['Make a timely decision to go around. Never sacrifice a good approach or landing just to land on desired spot.'],
  planning: [
    'Runway length, width, surface condition.',
    'Effect of high-density altitude and landing distance required.',
    'Consideration of obstructions or hazards.',
    'Landing performance data and limitations.',
    'Effect of flaps on approach and landing.',
    'Effect of flaps and best glide speed.',
    'Anticipate the effect of wind drift, yaw, necessary control inputs.',
    'Wind shear and wake turbulence considerations.',
    'Timely execution of go-around if necessary.'
  ],
  faults: [
    'Use of throttle to increase the glide instead of merely clearing the engine.',
    'Overextension of downwind leg resulting from tailwind.',
    'Inadequate compensation for wind drift on base leg.',
    'Skidding turns used to increase gliding distance.',
    'Premature flap extension/landing gear extension.',
    'Improper pitch and attitude control during round out and touchdown.',
    'Excessive airspeed that results in floating before touchdown.',
    'Failure to compensate for wind drift throughout landing.',
    'Forcing the airplane onto the runway to avoid overshooting designated spot.'
  ],
  acs: {
    C: { Airspeed: 'Establish appropriate glide speed', Altitude: 'Position airplane not more than 1000’ AGL or appropriate altitude based on aircraft on the downwind leg parallel to landing runway' }
  },
  acsNotes: [
    'Complete appropriate checklist(s), make radio calls as appropriate.',
    'Plan and follow a flightpath to the selected landing area considering altitude, wind, terrain, and obstructions.',
    'Select the most suitable touchdown point based on wind, landing surface, obstructions, and aircraft limitations.',
    'Correctly configure airplane; as necessary, correlate crosswind and slip direction.',
    'Touchdown at or within 200’ beyond specified point.'
  ]
},

{
  id: 'go-around', name: 'Go-Around / Rejected Landing', cat: 'landing', page: '73–74',
  ref: 'AFH § 9-10, ACS Private / Commercial / Flight Instructor.',
  levels: ['P','C','I'],
  desc: 'This maneuver is used when a landing must be rejected. The airplane is transitioned from approach to immediately arresting any further descent and initiating a climb.',
  obj: 'Develop the pilot’s ability to recognize the need to go-around and the importance of making a timely decision.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Smoothly apply maximum allowable power. Carb heat off if installed.',
      'Level the wings and transition to a [VX] or [VY] climb pitch attitude.',
      'Retract flaps to 20˚ or T/O.',
      'Advise ATC or traffic of intentions via transmitting “Going Around” over the radio when practical.',
      'Once a positive rate of climb has been established, retract flaps to 10˚ if applicable.',
      'If retractable gear, verify positive rate of climb, then “Identify and Verify” Gear Up.',
      'Accelerate to [VY] and with positive rate of climb retract flaps to 0˚.',
      'Adjust trim as required.',
      'Follow standard procedures to resume normal flight.'
    ]}
  ],
  notes: [],
  planning: [
    'Situations where a go-around is necessary.',
    'Over/under shoot of runway or aim point.',
    'Aircraft, vehicle, people, objects on runway.',
    'Unstable approach at any time in the pattern.',
    'Prompt decision making.',
    'Wind shear and wake turbulence considerations.'
  ],
  faults: [
    'Failure to apply full power.',
    'Failure to retract flaps.',
    'Failure to control pitch, to slow or stop descent.',
    'Stall/spin awareness.'
  ],
  acs: {
    P: { Airspeed: 'V<sub>Y</sub> + 10/-5 KIAS', Altitude: 'NA', Heading: 'Maneuver to the side of runway to avoid traffic' },
    C: { Airspeed: 'V<sub>Y</sub> +/- 5 KIAS',   Altitude: 'NA', Heading: 'Maneuver to the side of runway to avoid traffic' }
  },
  acsNotes: [
    'Apply takeoff power immediately, pitch for V<sub>X</sub> or V<sub>Y</sub>.',
    'Retract flaps.',
    'Maintain directional control.'
  ]
},

{
  id: 'touch-and-go', name: 'Touch and Go', cat: 'landing', page: '75–76',
  ref: 'AFH § 9-10, ACS Private / Commercial / Flight Instructor.',
  levels: ['P','C','I'],
  desc: 'This maneuver is an operation by an aircraft that lands and departs on a runway without stopping or exiting the runway. Similar to the go-around or rejected landing, but considered common during pattern work when there isn’t a need to stop or exit the runway.',
  obj: 'Develop the pilot’s ability to conduct landing and taking off without stopping or exiting the runway.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Ensure that the before landing checklist is completed before any approach is attempted.',
      'Complete the appropriate traffic pattern according to type of approach being conducted.',
      'Complete the appropriate landing procedure based on the type of approach being conducted.',
      'After the aircraft is safely on the ground and directional control is maintained, call out “Flaps Identified” and wait for the instructor’s response, “Flaps Verified” before retracting flaps, and continue to maintain centerline with rudder pedals and ailerons into the crosswind if applicable.',
      'Check engine instruments and tachometer (RPM). Turn off Carb Heat if applicable.',
      'Verify Flaps up or set for Takeoff.',
      'Smoothly apply full power while applying back pressure on the yoke. Do not advance the throttle too rapidly as this will cause the tail to strike.',
      'Verify engine instruments are in the green, airspeed alive.',
      'From this point, follow appropriate takeoff procedures based on the type of takeoff to be conducted. Adjust trim as necessary.',
      'At approximately 200’ AGL perform the climb flow check, then verify checklist. Maintain runway alignment and verify systems are operating normally.',
      'Maintain runway heading until 300’ below TPA or as directed by ATC before turning crosswind.',
      'At 1000’ AGL, lower the pitch to establish and maintain [VCC].',
      'Execute a departure procedure, or remain in the traffic pattern, as appropriate.'
    ]}
  ],
  notes: [],
  planning: [
    'Situations where a touch-and-go is necessary.',
    'Over/under shoot of runway or aim point.',
    'Aircraft, vehicles, people, objects on the runway.',
    'Unstable approach at any time in the pattern.',
    'Prompt decision making.',
    'Wind shear and wake turbulence considerations.'
  ],
  faults: [
    'Failure to apply full power.',
    'Failure to retract flaps.',
    'Failure to control pitch, to slow or stop descent.',
    'Stall/spin awareness.'
  ],
  acs: {}, acsNotes: []
},

/* ===================== EMERGENCIES ===================== */
{
  id: 'eng-fail-liftoff', name: 'Engine Failure After Liftoff', cat: 'emerg', page: '78–79',
  ref: 'AFH § 18-7.',
  levels: ['P','C','I'],
  subtitle: 'Demonstration',
  desc: 'This maneuver is used to land safely on the ground when the aircraft must lose engine power shortly after takeoff.',
  obj: 'To develop comprehension and experience with takeoff emergencies, takeoff briefings and takeoff aerodynamics.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Taxi for a full-length takeoff. Plan for a no flaps landing, check runway length, and do not attempt unless a normal landing is assured.',
      'Before takeoff checklist — Complete. Brief and configure normal takeoff procedure; brief the demonstration procedure and minimums.',
      'Coordinate with ATC or CTAF. Make sure the other traffic knows you intend to land after the takeoff (CTAF). Request “The Option on takeoff for simulated engine failure after rotation to a full stop.” Obtain a takeoff clearance (when appropriate).',
      'Normal Takeoff — Perform. Climb to an altitude that will allow recovery to a glide speed. Do not attempt below 50’ AGL.',
      'Altitude — Call out “above 75’, simulating engine failure.”',
      'Carburetor Heat — On (if applicable).',
      'Throttle — Idle.',
      'Pitch — For [VG]. Maintain a nose low attitude until reaching flare height or best glide speed.',
      'Landing — Perform. Maintain the takeoff configuration if appropriate for landing. Perform a full stop, then taxi back (if adequate runway is not available) for a normal takeoff. Coordinate with ATC when appropriate.'
    ]}
  ],
  notes: [],
  planning: [
    'Appropriate recovery altitude for simulated emergency descents.',
    'Practical use of emergency descents.',
    'Different configurations for emergency descents.'
  ],
  faults: [
    'Overbanking tendency.',
    'Failure to retract flaps.',
    'Uncoordinated use of flight controls.',
    'Failure to reduce power to idle.',
    'Failure to maintain desired airspeed.'
  ],
  acs: {}, acsNotes: []
},

{
  id: 'eng-fail-departure', name: 'Engine Failure on Departure', cat: 'emerg', page: '80–81',
  ref: 'AFH § 18-7.',
  levels: ['C','I'],
  subtitle: '(180° Turn Back to the "Runway")',
  desc: 'This maneuver is used to land safely on the ground when the aircraft must lose engine power shortly after takeoff.',
  obj: 'To develop comprehension and experience with takeoff emergencies, takeoff briefings and takeoff aerodynamics.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'At a safe altitude (hard deck selected) an imaginary runway underneath you as a target.',
      'Fly upwind directly away from hard deck altitude at departure airspeed and configuration. Note the point of “departure”.',
      'At 1000’ above the hard deck, smoothly reduce the throttle to idle (carb heat if appropriate) and pitch for best glide. Simultaneously roll into a steep bank turn.',
      'A 180° turn will not align you with the runway and plan on having a tailwind.',
      'Look to both sides of the aircraft while maneuvering with a failed engine for a potential runway at low airspeed — remember that altitude is your friend in this instance.',
      'The correct procedure for engine failure on takeoff is to lower the nose and land straight ahead, however there is a safe altitude for every pilot to attempt a return to the airport. Practice of this maneuver can help the student determine this altitude. ALWAYS include a generous safety margin due to the complex nature of this maneuver.'
    ]}
  ],
  notes: [
    'Select a minimum safe altitude that allows for power-off acceleration to the airplane’s recommended glide speed before landing. An engine failure below that minimum altitude puts the crew in the region of reverse command and not enough speed to flare without stalling prior to touchdown. DO NOT ATTEMPT this maneuver at night or on a wet runway — it is not authorized during those conditions.',
    'There is an altitude at which a safe return can be made to an airport when an engine failure occurs during takeoff. The problem is that it is not the same altitude for every pilot in every aircraft on any given day. The price of failure is SEVERE — if you do not know what the altitude is when the engine failure occurs, do NOT attempt to return to the runway.',
    'This maneuver may be attempted at a towered airport with permission from the tower on a dual flight only. The runway must be at least 5000’ in length and total wind, based on the most restrictive report, may not be in excess of 10 knots.'
  ],
  planning: [], faults: [],
  acs: {}, acsNotes: []
},

{
  id: 'emergency-descent', name: 'Emergency Descent', cat: 'emerg', page: '82–83',
  ref: 'AFH § 18-8, ACS Private / Commercial / Flight Instructor.',
  levels: ['P','C','I'],
  desc: 'This maneuver is used when the aircraft must lose altitude rapidly and/or get on the ground as soon as possible.',
  obj: 'To develop the pilot’s ability to descend the airplane as rapidly as possible, within the limitations of the airplane, to an altitude from which a safe landing can be made.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Reduce the throttle to idle.',
      'Below [VFE] gradually extend flaps to full position.',
      'Bank the airplane 30˚–45˚ and turn as you begin descending.',
      'Maintain airspeed at or below [VFE] during the descent.',
      'As you are turning, clear the area below.',
      'Level the wings and start to level off before your desired altitude. Lead level off by 10% of the VSI.',
      'Simultaneously, bring the throttle back to cruise, gradually retract flaps.',
      'Resume cruise or proceed with landing.'
    ]}
  ],
  notes: [],
  planning: [
    'Appropriate recovery altitude for simulated emergency descents.',
    'Practical use of emergency descents.',
    'Different configurations for emergency descents.'
  ],
  faults: [
    'Overbanking tendency.',
    'Failure to retract flaps.',
    'Uncoordinated use of flight controls.',
    'Failure to reduce power to idle.',
    'Failure to maintain desired airspeed.'
  ],
  acs: {
    P: { Airspeed: 'V<sub>FE</sub> +0 /-10 KIAS', Altitude: 'Level off at a specified altitude +/- 100 ft.', Bank: '30–45˚' },
    C: { Airspeed: 'V<sub>FE</sub> +0 /-10 KIAS', Altitude: 'Level off at a specified altitude +/- 100 ft.', Bank: '30–45˚' }
  },
  acsNotes: ['Maintain orientation and recover smoothly.', 'Complete appropriate checklist(s).']
},

{
  id: 'eng-fail-flight', name: 'Engine Failure in Flight', cat: 'emerg', page: '84',
  ref: 'AFH § 18-7.',
  levels: ['P','C','I'],
  desc: 'This maneuver is used to land safely on the ground when the aircraft must lose engine power during flight.',
  obj: 'To develop comprehension and experience with inflight emergencies.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Fly the airplane as you immediately apply full carb heat (if carburetor equipped) and/or check fuel on both or switch fuel tanks, hit fuel boost or pump, and mixture full rich.',
      'Point it toward a landing site.',
      'Establish best-glide airspeed [VG].',
      'Next, if you’ve got enough altitude, which equals time, confirm the failure.',
      'Follow appropriate restart procedures for your aircraft.',
      'Finally, if the restart fails, then you’ll land the aircraft without power.'
    ]}
  ],
  notes: [],
  planning: [
    'Appropriate recovery initial response with maintaining and control.',
    'Practical use of emergency procedures, flows, and checklists.',
    'Different configurations and situations for the emergency.'
  ],
  faults: [
    'Rushing to complete and skipping steps.',
    'Failure to make radio call and/or squawk code change.',
    'Uncoordinated use of flight controls.',
    'Turning battery/master switch off too early.',
    'Only 1 attempt to restart with plenty of altitude for additional attempts.',
    'Failure to maintain desired airspeed.'
  ],
  acs: {}, acsNotes: []
},

{
  id: 'emergency-approach', name: 'Emergency Approach and Landing', cat: 'emerg', page: '85–86',
  ref: 'AFH § 9-28, ACS Private / Commercial / Flight Instructor.',
  levels: ['P','C','I'],
  desc: 'This maneuver simulates an approach and landing with an engine failure. Idle power is used, the airplane is flown at best glide speed to a suitable emergency landing area.',
  obj: 'To develop the pilot’s ability to perform emergency approaches without power, simulating an engine failure.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Pre-maneuver check.',
      'Reduce throttle to idle.',
      'Trim for best glide speed [VG].',
      'Find a suitable emergency landing area.',
      'Perform restart flow and verify with checklist.',
      'Maintain a rectangular course around the emergency landing area.',
      'Distress call on 121.5 (or current ATC) and squawk 7700.',
      'Perform secure flow, verify with checklist.',
      'Flaps as required.',
      'Instructor will clear engine as necessary.',
      'Break off at 500’ AGL.'
    ]},
    { name: 'RECOVERY', steps: [
      'Smoothly apply maximum allowable power.',
      'Level the wings and transition to a climb pitch attitude that will slow or stop the descent.',
      'Retract flaps to 20˚.',
      'Once a positive rate of climb has been established, retract flaps to 10˚.',
      'Accelerate to [VY] and with positive rate of climb retract flaps to 0˚.',
      'Adjust trim as required.'
    ]},
    { name: 'RESTART FLOW CHECK', steps: [
      'Mixture ~ Rich',
      'Carburetor heat ~ On (if applicable)',
      'Fuel Pump ~ On (if installed)',
      'Ignition ~ Left, right, both',
      'Primer ~ In and locked',
      'Fuel Selector ~ On (L/R/Both)',
      'Magnetos ~ Off/L/R/Both/Crank'
    ]},
    { name: 'SECURE FLOW CHECK', steps: [
      'Mixture ~ Cutoff',
      'Carburetor heat ~ Off (if installed)',
      'Fuel pump ~ Off (if installed)',
      'Ignition ~ Off',
      'Master switch ~ Off (if no longer required)',
      'Fuel Selector ~ Off',
      'Carburetor heat ~ Off (if installed)'
    ]}
  ],
  notes: [],
  planning: [
    'The use of fields vs. roads.',
    'Orientation to the wind.',
    'Performance of flow check.',
    'Timely execution of go-around if necessary.',
    'Consideration of obstructions or hazards.',
    'Effects of flaps and best glide speed.',
    'Prompt decision making.',
    'Wind shear considerations.'
  ],
  faults: [
    'Failure to apply full power on go-around.',
    'Failure to retract flaps on go-around.',
    'Failure to maintain desired airspeed.',
    'Inappropriate choice of landing area.',
    'Faulty setup.',
    'Failure to reduce power to idle.'
  ],
  acs: {
    P: { Airspeed: 'Best glide +/- 10 KIAS', Altitude: 'NA', Heading: 'Maintain directional control' },
    C: { Airspeed: 'Best glide +/- 10 KIAS', Altitude: 'NA', Heading: 'Maintain directional control' }
  },
  acsNotes: [
    'Select, plan, and follow a flightpath to a suitable landing area considering altitude, available glide distance, wind, terrain, and obstructions.',
    'Complete appropriate checklist(s).'
  ]
},

{
  id: 'spin-training', name: 'Spin Training', cat: 'emerg', page: '88–89',
  ref: 'AFH 5-22 to 5-25, ACS Private (spin awareness) / Commercial (spin awareness) / Flight Instructor.',
  levels: ['I'],
  subtitle: '(for CFI spin endorsements)',
  memoryAid: 'PARE — Refer to Vol 1, Unit 5, Section 1, Appendix – General: Section 11.22',
  desc: 'Situations and conditions which can lead to a spin. Spin entry and recovery techniques.',
  obj: 'Develop the pilot’s ability to recognize a spin and the techniques required to recover from an incipient spin as well as a developed spin.',
  phases: [
    { name: 'PROCEDURE', steps: [
      'Ensure entry altitude is at least 5000’ AGL.',
      'Pre-maneuver check.',
      'Set up for a power off stall in the clean configuration.',
      'Before the stall occurs ensure that the elevator is in a full nose up position with full back pressure on the yoke to the stops, ailerons are neutral, and the engine is at idle.',
      'As the nose drops, apply full rudder in the desired direction of the spin.'
    ]},
    { name: 'RECOVERY (PARE)', steps: [
      'Power — Idle',
      'Ailerons — Neutral',
      'Rudder — Full in the opposite direction of the turn',
      'Elevator — Forward pressure to break the stall'
    ]},
    { name: 'COMPLETION OF RECOVERY', steps: [
      'When the rotation stops, relax the forward pressure on the elevator and smoothly recover from the dive by applying back pressure and bringing the nose up to level pitch attitude.',
      'As the nose comes back to level, normal cruise power needs to be smoothly applied as the aircraft approaches normal cruise airspeed.'
    ]}
  ],
  notes: [
    'EQUIPMENT: Spin approved Cessna 152s or Cessna 172s that can make (utility category) may be used to conduct spin training.',
    'FOR INCIPIENT SPIN: after 180° of rotation, immediately execute the recovery procedure.',
    'FOR FULLY DEVELOPED SPIN: the first 360° of rotation is the spin entry. The second 360° is the developed spin. After the second 360° of rotation, immediately begin the recovery procedure.'
  ],
  planning: [
    'Factors affecting the stall.',
    'Entry techniques.',
    'Excessive pitch attitude to induce a stall.',
    'Carefully check to ensure the CG is in limits.',
    'Ensure there is sufficient altitude.',
    'Orient on a cardinal heading.',
    'Understand that the student may not see much the first couple of times.'
  ],
  faults: [
    'Not holding the yoke against the stops.',
    'Not holding FULL rudder.',
    'Attempting to stop the rotation with the ailerons.',
    'Breaking the stall before the rotation has stopped.'
  ],
  acs: {
    I: { Airspeed: 'NA', Altitude: 'Entry altitude that allows for task completion no lower than 4,000’ AGL', Heading: 'NA' }
  },
  acsNotes: ['Clear the area.', 'Enter and recover from an intentional spin if requested by evaluator.']
}

];
