export const pgFacilityImages = [
  {
    id: "full-house",
    title: "Full House",
    image: "/images/pg/house.png"
  },
  {
    id: "one-bed",
    title: "1 Bed Room",
    image: "/images/pg/1sharingbedroom.png"
  },
  {
    id: "two-bed",
    title: "2 Bed Room",
    image: "/images/pg/2sharingbedroom.png"
  },
  {
    id: "three-bed",
    title: "3 Bed Room",
    image: "/images/pg/3sharingbedroom.png"
  },
  {
    id: "bathroom",
    title: "Bathroom",
    image: "/images/pg/bathroom.png"
  },
  {
    id: "mess",
    title: "Mess & Dining",
    image: "/images/pg/mess.png"
  }
];

export const getFullHouseImage = () => {
  return pgFacilityImages.find((img) => img.id === 'full-house')?.image || '/images/pg/house.png';
};
