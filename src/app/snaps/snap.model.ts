export interface Snap {
  id: string;
  title: string;
  snapId: number;
  secret: string;
  server: string;
  location: [number, number]; // [latitude, longitude] as per Location.java @JsonProperty("location")
  thumbNailUrl: string;
  thumbNailWidth: number;
  thumbNailHeight: number;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  dateTaken: Date;
}
