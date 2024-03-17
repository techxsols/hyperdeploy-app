import type { Hex } from 'viem';

// Deternimistically assign memorable nicknames to Ethereum address
// Names are coming from the dictionary
function getNickname(address: Hex): string {
  const adjectives = [
    'Adorable',
    'Adventurous',
    'Aggressive',
    'Agreeable',
    'Alert',
    'Alive',
    'Amazing',
    'Angry',
    'Awesome',
    'Beautiful',
    'Blissful',
    'Brave',
    'Calm',
    'Careful',
    'Clever',
    'Colorful',
    'Cool',
    'Courageous',
    'Dazzling',
    'Dependable',
    'Determined',
    'Eager',
    'Elastic',
    'Elegant',
    'Energetic',
    'Enthusiastic',
    'Excellent',
    'Excited',
    'Fantastic',
    'Fierce',
    'Friendly',
    'Funny',
    'Gentle',
    'Gifted',
    'Glamorous',
    'Great',
    'Happy',
    'Healthy',
    'Helpful',
    'Hilarious',
    'Important',
    'Inquisitive',
    'Jolly',
    'Kind',
    'Lively',
    'Lovely',
    'Lucky',
    'Modern',
    'Modest',
    'Muscular',
    'Nice',
    'Optimistic',
    'Peaceful',
    'Perfect',
    'Playful',
    'Polite',
    'Proud',
    'Quick',
    'Quiet',
    'Quirky',
    'Relaxed',
    'Resourceful',
    'Responsible',
    'Romantic',
    'Sad',
    'Serene',
    'Sharp',
    'Silly',
    'Sleepy',
    'Smart',
    'Smiling',
    'Social',
    'Sophisticated',
    'Sporty',
    'Steady',
    'Strong',
    'Successful',
    'Super',
    'Talented',
    'Thoughtful',
    'Trusting',
    'Upbeat',
    'Vibrant',
    'Vigilant',
    'Witty',
    'Wonderful',
    'Zealous',
  ];

  const nouns = [
    'Account',
    'Address',
    'Airplane',
    'Animal',
    'Apple',
    'Baby',
    'Ball',
    'Bank',
    'Bar',
    'Bear',
    'Bed',
    'Beer',
    'Bike',
    'Bird',
    'Boat',
    'Book',
    'Boy',
    'Bread',
    'Brother',
    'Bus',
    'Butter',
    'Car',
    'Cat',
    'Chair',
    'Cheese',
    'Child',
    'Church',
    'City',
    'Cow',
    'Cup',
    'Dog',
    'Door',
    'Duck',
    'Egg',
    'Elephant',
    'Eye',
    'Factory',
    'Father',
    'Fish',
    'Girl',
    'Girl',
    'Goat',
    'Gold',
    'Grass',
    'Guy',
    'Hamster',
    'Horse',
    'House',
    'Ice',
    'Jacket',
    'Jar',
    'Kid',
    'Knife',
    'Lake',
    'Lamp',
    'Leaf',
    'Leg',
    'Lion',
    'Man',
    'Map',
    'Mother',
    'Mouse',
    'Mouth',
    'Mountain',
    'Name',
    'Neck',
    'Nose',
    'Ocean',
    'Orange',
    'Oven',
    'Paper',
    'Parrot',
    'Pen',
    'Pencil',
    'Person',
    'Pig',
    'Pond',
    'Potato',
    'Queen',
    'River',
    'Road',
    'Rock',
    'Roof',
    'Rose',
    'Sea',
    'Sheep',
    'Shirt',
    'Shoe',
    'Sky',
    'Snake',
    'Sock',
    'Spider',
    'Spoon',
    'Star',
    'Street',
    'Sun',
    'Table',
    'Tea',
    'Teacher',
    'Tent',
    'Tree',
    'Truck',
    'Umbrella',
    'Wall',
    'Water',
    'Wheel',
    'Window',
    'Wood',
  ];

  const adjectiveIndex = BigInt(address) % BigInt(adjectives.length);
  const nounIndex = BigInt(address) % BigInt(nouns.length);

  return `${adjectives[Number(adjectiveIndex)]} ${nouns[Number(nounIndex)]}`;
}

export default getNickname;
