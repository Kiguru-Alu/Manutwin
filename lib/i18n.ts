/**
 * Handles NFR-4: Multilingual support definitions.
 * Provides instant toggle mappings between English, Swahili (Kiswahili), and Kinyarwanda
 * to fit East African shop floor operations in Kenya and Rwanda.
 */

export const i18nDict = {
  en: {
    select_station: 'Select Production Station',
    enter_pin: 'Enter 4-Digit PIN',
    login_btn: 'Verify & Login',
    machine_halt: 'MACHINE HALT',
    resolve_halt: 'RESOLVE HALT',
    select_reason: 'Select Downtime Reason Code',
    reason_power: 'POWER OUTAGE',
    reason_mechanical: 'MECHANICAL FAULT',
    reason_jam: 'PRODUCT JAM',
    reason_maintenance: 'SCHEDULED MAINTENANCE',
    submit_output: 'Log Package Output (30 Mins)',
    package_count_label: 'Physical Package Count',
    submit_btn: 'Submit Output Log',
    active_halt_msg: 'Line is Stopped. Resolve halt to resume.',
    logs_syncing: 'Syncing offline records...',
    logs_synced: 'All records synced.',
    logs_offline: 'Running offline. Data saved locally.',
    back_to_launcher: 'Launcher Home',
    operator_role: 'Station Operator',
    pin_error: 'Invalid PIN. Access denied.',
    station_required: 'Please select a station first.',
    downtime_minutes: 'Downtime Minutes',
    packages_logged: 'Packages Logged',
    timestamp: 'Timestamp',
    status: 'Status',
    synced: 'Synced',
    cached: 'Cached Offline',
    no_active_halt: 'Line running normally.',
    shift_summary: 'Operator Shift Summary',
    logout: 'Exit Session',
  },
  sw: {
    select_station: 'Chagua Kituo cha Uzalishaji',
    enter_pin: 'Weka PIN ya Tarakimu 4',
    login_btn: 'Thibitisha na Uingie',
    machine_halt: 'SIMAMISHA MASHINE',
    resolve_halt: 'TATUA KUSIMAMA',
    select_reason: 'Chagua Sababu ya Kusimama',
    reason_power: 'ITILAFU YA UMEME',
    reason_mechanical: 'ITILAFU YA KIMEKANIKA',
    reason_jam: 'MASHINE KUFUNGANA',
    reason_maintenance: 'MATENGENEZO YALIYOPANGWA',
    submit_output: 'Rekodi Matokeo ya Kifurushi (Dakika 30)',
    package_count_label: 'Idadi ya Vifurushi vya Kimwili',
    submit_btn: 'Wasilisha Matokeo',
    active_halt_msg: 'Uzalishaji Umesimama. Tatua hitilafu kuendelea.',
    logs_syncing: 'Kusawazisha rekodi za nje ya mtandao...',
    logs_synced: 'Rekodi zote zimesawazishwa.',
    logs_offline: 'Nje ya mtandao. Data imehifadhiwa ndani.',
    back_to_launcher: 'Nyumbani',
    operator_role: 'Mwendeshaji Kituo',
    pin_error: 'PIN si sahihi. Ufikiaji umekataliwa.',
    station_required: 'Tafadhali chagua kituo kwanza.',
    downtime_minutes: 'Dakika za Kusimama',
    packages_logged: 'Vifurushi Vilivyorekodiwa',
    timestamp: 'Muda',
    status: 'Hali',
    synced: 'Imesawazishwa',
    cached: 'Imehifadhiwa Ndani',
    no_active_halt: 'Mashine inafanya kazi kawaida.',
    shift_summary: 'Muhtasari wa Zamu ya Mwendeshaji',
    logout: 'Ondoka kwenye Kikao',
  },
  rw: {
    select_station: 'Hitamo Sitasiyo y\'Umusaruro',
    enter_pin: 'Yinjiza PIN y\'Imibare 4',
    login_btn: 'Emeza & Yinjira',
    machine_halt: 'HAGARIKA IMASHINI',
    resolve_halt: 'KUMURA GUHAGARARA',
    select_reason: 'Hitamo Impamvu yo Guhagarara',
    reason_power: 'IKIBEZO CY\'AMASHANYARAZI',
    reason_mechanical: 'IKIBEZO CY\'IMASHINI',
    reason_jam: 'IMASHINI YAZIBAMYE',
    reason_maintenance: 'KUBUNGABUNGA IMASHINI',
    submit_output: 'Andika Umusaruro w\'Ibipfunyika (Imin 30)',
    package_count_label: 'Umubare w\'Ibipfunyika byakozwe',
    submit_btn: 'Kohereza Umusaruro',
    active_halt_msg: 'Umusaruro Wahagaze. Mura ikibazo ngo ukomeze.',
    logs_syncing: 'Gufatanya amarekodi yo hanze...',
    logs_synced: 'Amarekodi yose yafatanijwe.',
    logs_offline: 'Nta murongo. Data yabitswe muri telefone.',
    back_to_launcher: 'Tangiriro',
    operator_role: 'Ukora kuri Sitasiyo',
    pin_error: 'PIN si yo. Ntiwemerewe kwinjira.',
    station_required: 'Kora hitamo sitasiyo mbere.',
    downtime_minutes: 'Iminota yo Guhagarara',
    packages_logged: 'Ibipfunyika Byanditswe',
    timestamp: 'Igihe',
    status: 'Imiterere',
    synced: 'Byafatanijwe',
    cached: 'Byabitswe Kuri Telefone',
    no_active_halt: 'Line irakora neza.',
    shift_summary: 'Incamake y\'Akazi k\'Ukora kuri Sitasiyo',
    logout: 'Sohoka mu Kikao',
  },
};

/**
 * Translates a given key based on the selected language setting.
 * Falls back to English if the key is missing.
 * 
 * @param lang - Selected language ('en', 'sw', 'rw').
 * @param key - Translation dictionary path.
 * @returns Translated text string.
 */
export function translate(lang: 'en' | 'sw' | 'rw', key: keyof typeof i18nDict['en']): string {
  const dictionary = i18nDict[lang] || i18nDict.en;
  return dictionary[key] || i18nDict.en[key] || String(key);
}
export type LanguageCode = 'en' | 'sw' | 'rw';
