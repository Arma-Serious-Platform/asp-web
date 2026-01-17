export type GameUnit = {
  name: string;
  quantity: number;
  details?: string;
};

export type GameCombatant = {
  name: string;
  playerCount: number;
  role: 'attack' | 'defense';
  color: 'red' | 'blue';
  units: GameUnit[];
};

export type WeekendGame = {
  id: string;
  title: string;
  date: string; // "Friday" or "Sunday"
  gameDate: string; // Specific date like "28 червня 2025"
  image: string;
  combatants: {
    side1: GameCombatant;
    side2: GameCombatant;
  };
  description: string;
  author: {
    tag: string;
    name: string;
  };
  viewUrl?: string;
  downloadUrl?: string;
};

export type WeekendGamesData = {
  announcementDate: string; // e.g., "28-29 червня 2025"
  games: WeekendGame[];
};

export type GameAnnouncement = {
  id: string;
  announcementDate: string; // e.g., "28-29 червня 2025"
  games: WeekendGame[]; // Always 4 games: 2 Friday, 2 Sunday
};

// Additional announcements for the announcements page
// Each announcement contains 4 games: 2 for Friday, 2 for Sunday
export const dummyAnnouncements: GameAnnouncement[] = [
  {
    id: 'ann-1',
    announcementDate: '28-29 червня 2025',
    games: [
      {
        id: '1',
        title: 'Target Spotted',
        date: 'Friday',
        gameDate: '28 червня 2025',
        image: '/images/hero.jpg',
        combatants: {
          side1: {
            name: 'US Army',
            playerCount: 75,
            role: 'attack',
            color: 'red',
            units: [
              {
                name: 'AH-1S Cobra',
                quantity: 1,
                details: '(8x TOW, 38x Hydra, полный БК пушки)',
              },
              { name: 'Leopard 2A4', quantity: 2 },
              { name: 'M3 Bradley CFV', quantity: 2 },
              { name: 'MH-6M "Littlebird"', quantity: 2 },
              { name: 'ПТРК "TOW"', quantity: 2, details: '(2x TOW-2A)' },
            ],
          },
          side2: {
            name: 'ЧДКЗ',
            playerCount: 75,
            role: 'defense',
            color: 'blue',
            units: [
              { name: 'Т-80БВ', quantity: 1 },
              { name: 'Т-80Б', quantity: 2 },
              { name: 'БМП-2', quantity: 4 },
              {
                name: '2С3 "Акация"',
                quantity: 1,
                details: '(80 ОФС/20 ДЫМ)',
              },
              { name: 'УАЗ-3151 (АГС-17)', quantity: 2 },
              {
                name: 'Ручные ПТРК "Метис"',
                quantity: 3,
                details: '(2х 9М115)',
              },
              { name: 'ПЗРК "Стрела-2М"', quantity: 2, details: '(По 1 пуску)' },
            ],
          },
        },
        description:
          'Поки західні аналітики продовжують обговорювати характер та масштаб російських навчань «Захід-2017», Росія завдає раптового та масованого удару. Без будь-яких попереджень табір союзних військ зазнає обстрілу зі ствольної артилерії.',
        author: {
          tag: '[WFA]',
          name: 'Agentos',
        },
      },
      {
        id: '2',
        title: 'Clear Sky',
        date: 'Friday',
        gameDate: '28 червня 2025',
        image: '/images/hero.jpg',
        combatants: {
          side1: {
            name: 'NATO Forces',
            playerCount: 80,
            role: 'attack',
            color: 'red',
            units: [
              { name: 'F-16 Fighting Falcon', quantity: 2 },
              { name: 'M1A2 Abrams', quantity: 5 },
              { name: 'M2 Bradley', quantity: 8 },
              { name: 'AH-64 Apache', quantity: 3 },
            ],
          },
          side2: {
            name: 'OPFOR',
            playerCount: 80,
            role: 'defense',
            color: 'blue',
            units: [
              { name: 'Т-72Б3', quantity: 4 },
              { name: 'БМП-3', quantity: 6 },
              { name: 'ЗСУ-23-4 "Шилка"', quantity: 3 },
              { name: 'Ми-24', quantity: 2 },
            ],
          },
        },
        description:
          'Операція з очищення неба від ворожих сил. Союзні війська проводять масштабну операцію з забезпечення повітряної переваги над територією конфлікту.',
        author: {
          tag: '[VTG]',
          name: 'Command',
        },
      },
      {
        id: '3',
        title: 'Operation Sand',
        date: 'Sunday',
        gameDate: '29 червня 2025',
        image: '/images/hero.jpg',
        combatants: {
          side1: {
            name: 'USMC',
            playerCount: 70,
            role: 'attack',
            color: 'red',
            units: [
              { name: 'M1A1 Abrams', quantity: 3 },
              { name: 'LAV-25', quantity: 5 },
              { name: 'AH-1Z Viper', quantity: 2 },
              { name: 'UH-1Y Venom', quantity: 4 },
            ],
          },
          side2: {
            name: 'Local Militia',
            playerCount: 70,
            role: 'defense',
            color: 'blue',
            units: [
              { name: 'Technical', quantity: 8 },
              { name: 'BTR-70', quantity: 4 },
              { name: 'ZU-23-2', quantity: 6 },
              { name: 'DShK', quantity: 10 },
            ],
          },
        },
        description:
          'Морська піхота США проводить десантну операцію на ворожу територію. Місцеві ополченці чинять запеклий опір, використовуючи партизанські тактики.',
        author: {
          tag: '[VTG]',
          name: 'Staff',
        },
      },
      {
        id: '4',
        title: 'Thunder Strike',
        date: 'Sunday',
        gameDate: '29 червня 2025',
        image: '/images/hero.jpg',
        combatants: {
          side1: {
            name: 'Coalition',
            playerCount: 85,
            role: 'attack',
            color: 'red',
            units: [
              { name: 'A-10 Thunderbolt II', quantity: 2 },
              { name: 'M2A3 Bradley', quantity: 7 },
              { name: 'M109 Paladin', quantity: 3 },
              { name: 'MH-60 Black Hawk', quantity: 4 },
            ],
          },
          side2: {
            name: 'Eastern Forces',
            playerCount: 85,
            role: 'defense',
            color: 'blue',
            units: [
              { name: 'Т-90А', quantity: 5 },
              { name: 'БМП-2М', quantity: 8 },
              { name: '2С19 "Мста-С"', quantity: 4 },
              { name: 'Тор-М1', quantity: 2 },
            ],
          },
        },
        description:
          "Масштабна операція коаліції з завдання вирішального удару по стратегічним об'єктам противника. Східні сили готуються до оборони, розгортаючи всі наявні ресурси.",
        author: {
          tag: '[VTG]',
          name: 'Operations',
        },
      },
    ],
  },
  {
    id: 'ann-2',
    announcementDate: '5-6 липня 2025',
    games: [
      {
        id: '5',
        title: 'Desert Storm',
        date: 'Friday',
        gameDate: '5 липня 2025',
        image: '/images/hero.jpg',
        combatants: {
          side1: {
            name: 'Coalition Forces',
            playerCount: 90,
            role: 'attack',
            color: 'red',
            units: [
              { name: 'M1A2 SEP', quantity: 6 },
              { name: 'AH-64D Apache', quantity: 4 },
              { name: 'F/A-18 Hornet', quantity: 2 },
              { name: 'M2A3 Bradley', quantity: 10 },
            ],
          },
          side2: {
            name: 'Desert Defenders',
            playerCount: 90,
            role: 'defense',
            color: 'blue',
            units: [
              { name: 'Т-72С', quantity: 5 },
              { name: 'БМП-2', quantity: 8 },
              { name: 'БРДМ-2', quantity: 6 },
              { name: 'ЗСУ-23-4', quantity: 4 },
            ],
          },
        },
        description:
          "Масштабна операція в пустельних умовах. Коаліційні сили проводять наступальну операцію з метою захоплення стратегічних об'єктів.",
        author: {
          tag: '[VTG]',
          name: 'Command',
        },
      },
      {
        id: '6',
        title: 'Urban Warfare',
        date: 'Friday',
        gameDate: '5 липня 2025',
        image: '/images/hero.jpg',
        combatants: {
          side1: {
            name: 'Special Forces',
            playerCount: 65,
            role: 'attack',
            color: 'red',
            units: [
              { name: 'MRAP', quantity: 4 },
              { name: 'UH-60 Black Hawk', quantity: 3 },
              { name: 'M4A1', quantity: 50 },
              { name: 'M249 SAW', quantity: 10 },
            ],
          },
          side2: {
            name: 'City Militia',
            playerCount: 65,
            role: 'defense',
            color: 'blue',
            units: [
              { name: 'Technical', quantity: 8 },
              { name: 'AK-74', quantity: 45 },
              { name: 'PKM', quantity: 8 },
              { name: 'RPG-7', quantity: 12 },
            ],
          },
        },
        description:
          'Інтенсивні бойові дії в міській місцевості. Спецпідрозділи проводять операцію з очищення міста від ворожих сил.',
        author: {
          tag: '[VTG]',
          name: 'Operations',
        },
      },
      {
        id: '7',
        title: 'Arctic Front',
        date: 'Sunday',
        gameDate: '6 липня 2025',
        image: '/images/hero.jpg',
        combatants: {
          side1: {
            name: 'NATO Arctic',
            playerCount: 70,
            role: 'attack',
            color: 'red',
            units: [
              { name: 'Leopard 2A6', quantity: 4 },
              { name: 'CV90', quantity: 6 },
              { name: 'AH-1Z Viper', quantity: 2 },
              { name: 'UH-1Y Venom', quantity: 3 },
            ],
          },
          side2: {
            name: 'Northern Forces',
            playerCount: 70,
            role: 'defense',
            color: 'blue',
            units: [
              { name: 'Т-80У', quantity: 3 },
              { name: 'БМП-3', quantity: 5 },
              { name: 'БТР-80', quantity: 4 },
              { name: 'Ми-8', quantity: 2 },
            ],
          },
        },
        description:
          'Бойові дії в арктичних умовах. НАТО сили проводять операцію в екстремальних погодних умовах з метою захоплення стратегічних позицій.',
        author: {
          tag: '[VTG]',
          name: 'Staff',
        },
      },
      {
        id: '8',
        title: 'Night Raid',
        date: 'Sunday',
        gameDate: '6 липня 2025',
        image: '/images/hero.jpg',
        combatants: {
          side1: {
            name: 'Night Stalkers',
            playerCount: 60,
            role: 'attack',
            color: 'red',
            units: [
              { name: 'MH-60 Black Hawk', quantity: 4 },
              { name: 'M4A1 SOPMOD', quantity: 45 },
              { name: 'M249 SAW', quantity: 8 },
              { name: 'M24 SWS', quantity: 6 },
            ],
          },
          side2: {
            name: 'Night Watch',
            playerCount: 60,
            role: 'defense',
            color: 'blue',
            units: [
              { name: 'БРДМ-2', quantity: 5 },
              { name: 'AK-74M', quantity: 40 },
              { name: 'PKP Pecheneg', quantity: 8 },
              { name: 'СВД', quantity: 5 },
            ],
          },
        },
        description:
          'Нічна спеціальна операція. Елітні підрозділи проводять рейд у темряві, використовуючи переваги нічного бачення та тактики прихованого проникнення.',
        author: {
          tag: '[VTG]',
          name: 'Special Ops',
        },
      },
    ],
  },
  {
    id: 'ann-3',
    announcementDate: '12-13 липня 2025',
    games: [
      {
        id: '9',
        title: 'Coastal Assault',
        date: 'Friday',
        gameDate: '12 липня 2025',
        image: '/images/hero.jpg',
        combatants: {
          side1: {
            name: 'Marine Expeditionary',
            playerCount: 85,
            role: 'attack',
            color: 'red',
            units: [
              { name: 'LCAC', quantity: 3 },
              { name: 'M1A1 Abrams', quantity: 5 },
              { name: 'AH-1Z Viper', quantity: 3 },
              { name: 'UH-1Y Venom', quantity: 5 },
            ],
          },
          side2: {
            name: 'Coastal Defense',
            playerCount: 85,
            role: 'defense',
            color: 'blue',
            units: [
              { name: 'Т-72Б3', quantity: 4 },
              { name: 'БМП-2', quantity: 7 },
              { name: '2С3 "Акация"', quantity: 3 },
              { name: 'ПЗРК "Стрела-2М"', quantity: 8 },
            ],
          },
        },
        description:
          'Морський десант на вороже узбережжя. Морська піхота проводить амфібійну операцію з висадки на берег та захоплення плацдарму.',
        author: {
          tag: '[VTG]',
          name: 'Naval Command',
        },
      },
      {
        id: '10',
        title: 'Mountain Pass',
        date: 'Friday',
        gameDate: '12 липня 2025',
        image: '/images/hero.jpg',
        combatants: {
          side1: {
            name: 'Alpine Division',
            playerCount: 75,
            role: 'attack',
            color: 'red',
            units: [
              { name: 'UH-60 Black Hawk', quantity: 4 },
              { name: 'M2A3 Bradley', quantity: 6 },
              { name: 'M4A1', quantity: 50 },
              { name: 'M240B', quantity: 8 },
            ],
          },
          side2: {
            name: 'Mountain Guard',
            playerCount: 75,
            role: 'defense',
            color: 'blue',
            units: [
              { name: 'БМП-3', quantity: 5 },
              { name: 'БТР-80', quantity: 4 },
              { name: 'АК-74', quantity: 45 },
              { name: 'ПКМ', quantity: 10 },
            ],
          },
        },
        description:
          'Бойові дії в гірській місцевості. Сили проводять операцію з прориву через стратегічний гірський перевал, контрольований противником.',
        author: {
          tag: '[VTG]',
          name: 'Mountain Ops',
        },
      },
      {
        id: '11',
        title: 'Iron Shield',
        date: 'Sunday',
        gameDate: '13 липня 2025',
        image: '/images/hero.jpg',
        combatants: {
          side1: {
            name: 'Allied Forces',
            playerCount: 80,
            role: 'attack',
            color: 'red',
            units: [
              { name: 'M1A2 Abrams', quantity: 6 },
              { name: 'M2A3 Bradley', quantity: 8 },
              { name: 'AH-64 Apache', quantity: 4 },
              { name: 'UH-60 Black Hawk', quantity: 5 },
            ],
          },
          side2: {
            name: 'Defensive Line',
            playerCount: 80,
            role: 'defense',
            color: 'blue',
            units: [
              { name: 'Т-80БВ', quantity: 4 },
              { name: 'БМП-2', quantity: 9 },
              { name: '2С19 "Мста-С"', quantity: 3 },
              { name: 'ПЗРК "Стрела-2М"', quantity: 6 },
            ],
          },
        },
        description:
          'Масована атака на укріплені позиції противника. Союзні сили намагаються прорвати оборонну лінію, використовуючи комбіновану тактику.',
        author: {
          tag: '[VTG]',
          name: 'Command',
        },
      },
      {
        id: '12',
        title: 'Silent Storm',
        date: 'Sunday',
        gameDate: '13 липня 2025',
        image: '/images/hero.jpg',
        combatants: {
          side1: {
            name: 'Special Ops',
            playerCount: 55,
            role: 'attack',
            color: 'red',
            units: [
              { name: 'MH-60 Black Hawk', quantity: 3 },
              { name: 'M4A1 SOPMOD', quantity: 40 },
              { name: 'M249 SAW', quantity: 6 },
              { name: 'M24 SWS', quantity: 5 },
            ],
          },
          side2: {
            name: 'Guard Force',
            playerCount: 55,
            role: 'defense',
            color: 'blue',
            units: [
              { name: 'БРДМ-2', quantity: 4 },
              { name: 'AK-74M', quantity: 35 },
              { name: 'PKP Pecheneg', quantity: 6 },
              { name: 'СВД', quantity: 4 },
            ],
          },
        },
        description:
          "Спеціальна операція з прихованого проникнення. Елітні підрозділи проводять рейд на стратегічний об'єкт противника.",
        author: {
          tag: '[VTG]',
          name: 'Special Ops',
        },
      },
    ],
  },
];

// Dummy data for weekend games
export const dummyWeekendGames: WeekendGamesData = {
  announcementDate: '28-29 червня 2025',
  games: [
    {
      id: '1',
      title: 'Target Spotted',
      date: 'Friday',
      gameDate: '28 червня 2025',
      image: '/images/hero.jpg',
      combatants: {
        side1: {
          name: 'US Army',
          playerCount: 75,
          role: 'attack',
          color: 'red',
          units: [
            { name: 'AH-1S Cobra', quantity: 2 },
            { name: 'Leopard 2A4', quantity: 4 },
            { name: 'M3 Bradley CFV', quantity: 6 },
            { name: 'MH-6M "Littlebird"', quantity: 3 },
            { name: 'ПТРК "TOW"', quantity: 8 },
          ],
        },
        side2: {
          name: 'ЧДКЗ',
          playerCount: 75,
          role: 'defense',
          color: 'blue',
          units: [
            { name: 'Т-80БВ', quantity: 3 },
            { name: 'Т-80Б', quantity: 2 },
            { name: 'БМП-2', quantity: 8 },
            { name: '2С3 "Акация"', quantity: 4 },
            { name: 'УАЗ-3151(АГС-17)', quantity: 5 },
            { name: 'Ручные ПТРК "Метис"', quantity: 10 },
            { name: 'ПЗРК "Стрела-2М"', quantity: 6 },
          ],
        },
      },
      description:
        'Поки західні аналітики продовжують обговорювати характер та масштаб російських навчань «Захід-2017», Росія завдає раптового та масованого удару. Без будь-яких попереджень табір союзних військ зазнає обстрілу зі ствольної артилерії.',
      author: {
        tag: '[WFA]',
        name: 'Agentos',
      },
    },
    {
      id: '2',
      title: 'Clear Sky',
      date: 'Friday',
      gameDate: '28 червня 2025',
      image: '/images/hero.jpg',
      combatants: {
        side1: {
          name: 'NATO Forces',
          playerCount: 80,
          role: 'attack',
          color: 'red',
          units: [
            { name: 'F-16 Fighting Falcon', quantity: 2 },
            { name: 'M1A2 Abrams', quantity: 5 },
            { name: 'M2 Bradley', quantity: 8 },
            { name: 'AH-64 Apache', quantity: 3 },
          ],
        },
        side2: {
          name: 'OPFOR',
          playerCount: 80,
          role: 'defense',
          color: 'blue',
          units: [
            { name: 'Т-72Б3', quantity: 4 },
            { name: 'БМП-3', quantity: 6 },
            { name: 'ЗСУ-23-4 "Шилка"', quantity: 3 },
            { name: 'Ми-24', quantity: 2 },
          ],
        },
      },
      description:
        'Операція з очищення неба від ворожих сил. Союзні війська проводять масштабну операцію з забезпечення повітряної переваги над територією конфлікту.',
      author: {
        tag: '[VTG]',
        name: 'Command',
      },
    },
    {
      id: '3',
      title: 'Operation Sand',
      date: 'Sunday',
      gameDate: '29 червня 2025',
      image: '/images/hero.jpg',
      combatants: {
        side1: {
          name: 'USMC',
          playerCount: 70,
          role: 'attack',
          color: 'red',
          units: [
            { name: 'M1A1 Abrams', quantity: 3 },
            { name: 'LAV-25', quantity: 5 },
            { name: 'AH-1Z Viper', quantity: 2 },
            { name: 'UH-1Y Venom', quantity: 4 },
          ],
        },
        side2: {
          name: 'Local Militia',
          playerCount: 70,
          role: 'defense',
          color: 'blue',
          units: [
            { name: 'Technical', quantity: 8 },
            { name: 'BTR-70', quantity: 4 },
            { name: 'ZU-23-2', quantity: 6 },
            { name: 'DShK', quantity: 10 },
          ],
        },
      },
      description:
        'Морська піхота США проводить десантну операцію на ворожу територію. Місцеві ополченці чинять запеклий опір, використовуючи партизанські тактики.',
      author: {
        tag: '[VTG]',
        name: 'Staff',
      },
    },
    {
      id: '4',
      title: 'Thunder Strike',
      date: 'Sunday',
      gameDate: '29 червня 2025',
      image: '/images/hero.jpg',
      combatants: {
        side1: {
          name: 'Coalition',
          playerCount: 85,
          role: 'attack',
          color: 'red',
          units: [
            { name: 'A-10 Thunderbolt II', quantity: 2 },
            { name: 'M2A3 Bradley', quantity: 7 },
            { name: 'M109 Paladin', quantity: 3 },
            { name: 'MH-60 Black Hawk', quantity: 4 },
          ],
        },
        side2: {
          name: 'Eastern Forces',
          playerCount: 85,
          role: 'defense',
          color: 'blue',
          units: [
            { name: 'Т-90А', quantity: 5 },
            { name: 'БМП-2М', quantity: 8 },
            { name: '2С19 "Мста-С"', quantity: 4 },
            { name: 'Тор-М1', quantity: 2 },
          ],
        },
      },
      description:
        "Масштабна операція коаліції з завдання вирішального удару по стратегічним об'єктам противника. Східні сили готуються до оборони, розгортаючи всі наявні ресурси.",
      author: {
        tag: '[VTG]',
        name: 'Operations',
      },
    },
  ],
};
