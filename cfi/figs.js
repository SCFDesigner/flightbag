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
};
