export interface GeoHash {
  djia:string; // dow jones industrial average opening like '12345.67'
  date: string; // date only, no time (format: yyyy-MM-dd)
  location: [number, number]; // [latitude, longitude]
}
