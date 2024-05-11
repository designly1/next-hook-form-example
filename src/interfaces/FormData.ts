export enum E_FavTeams {
	'arsenal' = 'Arsenal',
	'astonVilla' = 'Aston Villa',
	'brentford' = 'Brentford',
	'brighton' = 'Brighton',
	'burnley' = 'Burnley',
	'chelsea' = 'Chelsea',
	'crystalPalace' = 'Crystal Palace',
	'everton' = 'Everton',
	'fulham' = 'Fulham',
	'leedsUnited' = 'Leeds United',
	'leicesterCity' = 'Leicester City',
	'liverpool' = 'Liverpool',
}

export type T_FavTeams = keyof typeof E_FavTeams;

export interface I_FormData {
	fullName: string;
	email: string;
	phone: string;
	password: string;
	acceptTerms: boolean;
	favTeams: T_FavTeams[];
}
