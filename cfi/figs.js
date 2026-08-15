/* figs.js — explicit figure placement, overriding the fuzzy auto-mapper.
   Keyed lessonId -> exact script heading text -> asset paths.

   Why: the auto-mapper matches a lesson-plan figure to the script line whose
   wording is most similar. When the pared script renames a topic (the four
   left-turning tendencies each got their own heading, while the lesson plan
   pinned all four diagrams to one "Correct with right rudder" line), the match
   fails and every later figure cascades — II.D ended up with seven diagrams
   stacked on its last line and gyroscopic precession nowhere near its heading.
   Anything listed here is placed exactly and removed from the fuzzy pool. */
window.CFI_FIGS = {
  'ii-d-principles-of-flight-acs-info-': {
    'Drag': ['assets/874cef932186f9b2.png', 'assets/eec1fc37295cfd57.png'],
    'Airfoil Design — AI.II.D.K1': ['assets/4f1be76eb42b285b.png'],
    'Chord Line, Camber, Leading/Trailing Edge': ['assets/a97cad3f00c3434b.png'],
    'How the Airfoil Generates Lift': ['assets/9a75e5ddd3a3c87b.png'],
    'Wing Planform': ['assets/96c21597278f7477.png'],
    'Angle of Attack': ['assets/ed7aa99aa9bc7cf3.png'],
    'Maneuvering Speed (VA) & the Vg Diagram': ['assets/52c0b40087f3d381.png'],
    'Static vs. Dynamic Stability': ['assets/5608680c7b145ff9.png', 'assets/d43cd46dd45b001f.png', 'assets/bd89fe98cd65abdb.png'],
    'Longitudinal Stability (Pitch)': ['assets/6262217f27b610c4.png'],
    'Lateral Stability (Bank)': ['assets/2d8577c9f6777b97.png', 'assets/107fa3d7b738e9f2.png', 'assets/50216843ffec37ad.png'],
    'Directional Stability (Yaw)': ['assets/466f7a337daf21d6.png'],
    'Torque Reaction': ['assets/b9cbbd42b295c6ce.png'],
    'Spiraling Slipstream (Corkscrew Effect)': ['assets/d7f7ee9398d08471.png'],
    'Gyroscopic Precession': ['assets/9a39b66c3e33e748.png'],
    'Asymmetric Loading (P-Factor)': ['assets/8362b14d5e10f7e3.png'],
    'Wingtip Vortices — How They Form': ['assets/96055f3e31140113.png'],
    'Vortex Strength': ['assets/f607089068369f41.png'],
    'Ground Effect': ['assets/45d60be5024052f9.png'],
  },

  /* Systems — the examiner's other named weak spot ("draw the pitot-static
     system and the instruments on it"). Same cascade: 31 figures had piled
     onto one line near the end of the lesson. */
  'ii-e-flight-controls-systems': {
    'Ailerons': ['assets/773c322129d359ef.png', 'assets/b133ff85c7301be1.png',
                 'assets/4f1a37428cb4d680.png', 'assets/d5ce83c2cac09a12.png'],
    'Elevator': ['assets/2a05c3d8a8907bf6.png', 'assets/a9c32ab6a0d7c7b1.png', 'assets/8da0c16e39b8fdee.png'],
    'Rudder': ['assets/97c60a108051a5d7.png', 'assets/2b608b0d80aa3ac8.png'],
    'Flaps': ['assets/5d3366968d072b90.png'],
    'Trim Systems': ['assets/d50afd48ec55c7a4.png', 'assets/b46fa1baeb0a1994.png'],
    'Engine Components': ['assets/e9ab80f54971fdbf.png', 'assets/62fcc3bf65eb0d78.png'],
    'The Four-Stroke Cycle': ['assets/35428a1ce4f4fdf5.png'],
    'Ignition System': ['assets/01583dff1666b402.png', 'assets/cca387d22b94bca4.png'],
    'Induction — Carburetor vs. Fuel Injection': ['assets/7797991a3269923e.png'],
    'Oil System': ['assets/2bed04b89e2b1519.png', 'assets/e0c3ae1fb1a202ee.png'],
    'Cooling & Exhaust': ['assets/0cffcf593b485efb.png'],
    'Installation': ['assets/0adc68a640d83769.png'],
    'Fixed-Pitch Propellers': ['assets/ba336004f6ceb17f.png'],
    'Constant-Speed Propellers': ['assets/de6bc41c5119c2c4.png'],
    'Fuel System — AI.II.E.K1e': ['assets/2cc7f51ea6ffb977.png'],
    'Tanks, Selectors & Contamination': ['assets/396ce9109ab3dca1.png'],
    'Hydraulics': ['assets/efab581b6e3a592c.png'],
    'Generation & Protection': ['assets/92215b02df5b1cb2.png'],
    'Reading the Ammeter': ['assets/24a36835bb08ca25.png'],
    'Pitot-Static Flight Instruments — AI.II.E.K1h': ['assets/208d6797956dbb75.png'],
    'Altimeter': ['assets/a2ce20210f769a94.png'],
    'Vertical Speed Indicator': ['assets/3fb010258d253bd6.png', 'assets/f508329c304a5cbb.png'],
    'Power Sources': ['assets/cf3baa852541409f.png'],
    'Attitude & Heading Indicators': ['assets/069296be8b3f2618.png', 'assets/c014eb5072e52e76.png'],
    'Turn Instruments': ['assets/7a834987ff2e4725.png'],
    'Pressurization': ['assets/dd0ac048f4d47871.png', 'assets/ccbf395a29cec04c.png'],
    'Ice Protection — Deice & Anti-Ice — AI.II.E.K1j': ['assets/5f879751ff77ecc2.png'],
    'Airfoil Protection': ['assets/289334a562d98b49.png'],
    'Fixed vs. Portable': ['assets/961e9ffaa2464194.png'],
    'Masks & Cannulas': ['assets/4454aedd3ee8fe71.png'],
    'Types of Oxygen Systems': ['assets/3a42351679ac5878.png'],
  },

  /* The same four left-turning-tendency plates are reused by the slow-flight
     and stall lessons, where the lesson plan pins all four to one line. */
  'x-a-slow-flight': {
    'Torque reaction': ['assets/b9cbbd42b295c6ce.png'],
    'Spiraling slipstream': ['assets/d7f7ee9398d08471.png'],
    'Gyroscopic precession': ['assets/9a39b66c3e33e748.png'],
    'P-factor (asymmetric loading)': ['assets/8362b14d5e10f7e3.png'],
  },
  'x-b-demo-of-flight-characteristics': {
    'Torque reaction': ['assets/b9cbbd42b295c6ce.png'],
    'Spiraling slipstream (corkscrew effect)': ['assets/d7f7ee9398d08471.png'],
    'Gyroscopic precession': ['assets/9a39b66c3e33e748.png'],
    'Asymmetric loading (P-factor)': ['assets/8362b14d5e10f7e3.png'],
  },
  'x-c-power-off-stalls': {
    'Torque reaction': ['assets/b9cbbd42b295c6ce.png'],
    'Spiraling slipstream (corkscrew effect)': ['assets/d7f7ee9398d08471.png'],
    'Gyroscopic precession': ['assets/9a39b66c3e33e748.png'],
    'Asymmetric loading (P-factor)': ['assets/8362b14d5e10f7e3.png'],
  },
  'x-d-power-on-stalls': {
    'Torque reaction': ['assets/b9cbbd42b295c6ce.png'],
    'Spiraling slipstream (corkscrew effect)': ['assets/d7f7ee9398d08471.png'],
    'Gyroscopic precession': ['assets/9a39b66c3e33e748.png'],
    'Asymmetric loading (P-factor)': ['assets/8362b14d5e10f7e3.png'],
  },
  'x-e-accelerated-stalls': {
    'Stall Aerodynamics — Critical AOA & CLMAX': ['assets/3801200687c55c11.png', 'assets/0d21b2b00ccb4649.png'],
    'What Makes a Stall Accelerated — AI.X.E.K2': ['assets/d1364ffca12a1e66.png', 'assets/7825347be2a51e2f.png'],
    'Weight & CG': ['assets/3ccfe4a700ff4dff.png'],
    'Torque reaction': ['assets/b9cbbd42b295c6ce.png'],
    'Spiraling slipstream (corkscrew effect)': ['assets/d7f7ee9398d08471.png'],
    'Gyroscopic precession': ['assets/9a39b66c3e33e748.png'],
    'Asymmetric loading (P-factor)': ['assets/8362b14d5e10f7e3.png'],
  },

  'ix-a-steep-turns': {
    'Bank Angle, Load Factor & Stall Speed — AI.IX.A.K3d': ['assets/3f60be5ff9308ffc.png'],
    'Stall Speed': ['assets/b3de5a9cd324f8ef.png', 'assets/373a3c1f9dd8f385.png'],
    'Adverse Yaw — AI.IX.A.R5': ['assets/620f1beb9ebdef2e.png'],
    'Torque Effect — AI.IX.A.K3a, AI.IX.A.R5': ['assets/7afe8c71e9b244d9.png'],
    'Turn Radius': ['assets/7805919259984eef.png'],
    'Overbanking Tendency — AI.IX.A.K3b': ['assets/1b2aa74d6a7b847e.png'],
  },

  'vii-a-normal-takeoff-climb': {
    'Normal Takeoff — AI.VII.A.K1': ['assets/7ecc0d1d70e0cfb9.png'],
    'VX — Best Angle of Climb': ['assets/12a6b7a16567cbeb.png'],
    'Rotation (VR)': ['assets/cfa02279bdcbba12.png'],
    'Basics': ['assets/eb82abbb53f519f4.png', 'assets/d86ab4cdee5beaa4.png'],
    'Lift-Off#2': ['assets/ecfe33775b8cfafb.png'],
    'What it is': ['assets/b4e7c5bbf683fdc9.png'],
    'Microbursts — the most severe form': ['assets/7398f8cd383c734a.png'],
    'Vortex behavior': ['assets/1f2577e521fb373f.png'],
  },
  'vii-b-normal-approach-landing': {
    'Base Leg': ['assets/60e95559b168f6e8.png'],
    'Aim point': ['assets/f44c1a311ca00a29.png'],
    'Runway picture': ['assets/d79be05875bb2d68.png', 'assets/2c1997286294ccfb.png'],
    'Visual glidepath aids — VASI / PAPI': ['assets/b013a7ef14c9ad4b.png', 'assets/9b7504e879c67da3.png', 'assets/6174e857766560ab.png'],
    'Estimating height and movement': ['assets/0c8ea729f83855b7.png'],
    'Touchdown': ['assets/1a470bb2727418fd.png'],
    'RM: Crosswind Approach — AI.VII.B.K1, AI.VII.B.K4, AI.VII.B.R2a': ['assets/85e5efb03e972a6c.png'],
    'Crab method — not recommended': ['assets/d94b2452339fb494.png'],
    'Sideslip (wing-low) method — recommended': ['assets/74e89c58015c9ef0.png'],
    'Pilot responsibilities': ['assets/07da7626e73909fa.png', 'assets/ad36f64e5b40f409.png', 'assets/e32ea2eb88648b23.png'],
    'Wind Shear — AI.VII.B.R2b': ['assets/3b411b29dcaa91e4.png'],
    'Microbursts': ['assets/7398f8cd383c734a.png'],
    'Wake Turbulence — AI.VII.B.R2d': ['assets/1f2577e521fb373f.png'],
    'Vortex behavior': ['assets/399aa45e4ea71416.png'],
  },

  'iii-c-weather-information': {
    'Coriolis Force': ['assets/436765d59d9dfc79.png'],
    'Friction': ['assets/8c360d7fb8fbd107.png', 'assets/a75dd316399c785c.png'],
    'Mechanical': ['assets/efbafa377ac97918.png', 'assets/b8d7586e2311aa4b.png'],
    'Sources of vertical motion': ['assets/5658cd5ac12a7f6c.png'],
    'Cloud forms': ['assets/f213f9123aa55f0e.png', 'assets/6d2bc998a5f29a39.png', 'assets/1188ce4b61a82079.png'],
    'Cloud families by level': ['assets/78a1dfbe558ec2df.png'],
    'Microbursts': ['assets/abbd43f81785cd02.png'],
    'Surface Analysis Chart': ['assets/c34f8add87d1a139.png', 'assets/505c475e58b0afff.png', 'assets/8c79a1375bb2d8ea.png'],
    'Ceiling & Visibility (CVA)': ['assets/c58f29ee42ea979d.png', 'assets/f15c84b9a1f66d7f.png', 'assets/4bdd91cc19933798.png'],
    'Convective Outlook Chart': ['assets/a1fd9e6047c0c04e.png'],
    'PIREPs': ['assets/d97bdaeb30774d07.png'],
  },

  'v-d-taxiing-signs-lighting': {
    'Recognizing wind direction': ['assets/8c0572042b56d89e.png', 'assets/f2832626714a27e1.png'],
    'Night Operations — AI.V.D.K7d,AI.V.D.K6': ['assets/8ccd50a73dc93f2b.png', 'assets/8899bdc4e6edb7ef.png', 'assets/e349c249a2460ed7.png'],
    'Runway Designators': ['assets/90cc69fda0d3ffa5.png'],
    'Taxiway Centerline Markings': ['assets/a9eb43365b3bbc1b.png'],
    'Taxiway Edge Markings': ['assets/92afa281835dec62.png'],
    'Surface Painted Location Signs': ['assets/1c4ce8ec7c6311f8.jpeg'],
    'Geographic Position Markings': ['assets/8f412d37bb89120c.png'],
    'Runway Holding Position Markings on Taxiways': ['assets/c9e37f16e684805f.png'],
    'Holding Position Markings for Taxiways/Taxiway Intersections': ['assets/10b632b712ee7d47.png'],
    'Nonmovement Area Boundary Markings': ['assets/d76cbdbb6e4c7095.gif'],
    'Typical mandatory signs and applications': ['assets/960396911428ad4f.gif', 'assets/8feb6a0d613821e1.gif',
                                                 'assets/c767ddf2cf8ad18e.gif', 'assets/941b59a3a86b6e68.gif'],
    'Taxiway Location Sign': ['assets/2d89b81e63cbb3c9.gif'],
    'Runway Location Sign': ['assets/c0914fb45dfde624.gif'],
    'Runway Boundary Sign': ['assets/1dd653818a351467.gif'],
    'ILS Critical Area Boundary Sign': ['assets/b8e4762858c03269.gif'],
    'Destination Signs': ['assets/ae8ac6135a0e82b2.png'],
    'Information Signs': ['assets/fa0679569e9398b4.gif', 'assets/86054ea0221ccae1.gif'],
    'Runway Distance Remaining Signs': ['assets/4dcdaa844a93ff7a.gif'],
    'Runway Entrance Lights (REL)': ['assets/323508a669889385.png'],
  },
};
