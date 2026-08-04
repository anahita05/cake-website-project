import chocolateCake from "../assets/HomeIcon/chocolate-cake.jpg";
import pancake from "../assets/HomeIcon/pancake.jpg";
import orangeCake from "../assets/HomeIcon/orange-cake.jpg";
import fruitCake from "../assets/HomeIcon/fruit-cake.jpg";

export const products = [
  {
    id: 1,
    slug: "rich-chocolate-truffle-cake",
    name: "Rich Chocolate Truffle Cake",
    price: "$500",
    oldPrice: "$620",
    rating: "★★★★★",
    image: chocolateCake,
    description:
      "A decadent layered chocolate cake covered with silky chocolate truffle ganache and finished with premium chocolate curls. A dream dessert for every chocolate lover.",
    highlights: [
      {
        title: "Belgian Chocolate",
        subtitle: "Premium cocoa in every bite",
      },
      {
        title: "Freshly Baked",
        subtitle: "Made every morning",
      },
      {
        title: "Customer Favorite",
        subtitle: "500+ happy customers",
      },
    ],
    galleryItems: [
      { image: chocolateCake, imageAlt: "Chocolate cake slice" },
      { image: chocolateCake, imageAlt: "Chocolate ganache topping" },
      { image: chocolateCake, imageAlt: "Whole chocolate cake" },
    ],
    reviews: {
      count: 500,
      items: [
        {
          name: "Sarah Johnson",
          text: "The richest chocolate cake I've ever tasted. Every bite melts in your mouth.",
        },
        {
          name: "Alex Carter",
          text: "Perfect for birthdays. Everyone asked where I bought it.",
        },
        {
          name: "Nina Patel",
          text: "Fresh, moist, and beautifully decorated.",
        },
        {
          name: "Daniel Smith",
          text: "Arrived perfectly packaged and tasted amazing.",
        },
        {
          name: "Emma Wilson",
          text: "Worth every penny. I'll definitely order again.",
        },
        {
          name: "Liam Brown",
          text: "Rich flavor without being overly sweet.",
        },
      ],
    },
  },

  {
    id: 2,
    slug: "banana-walnut-pancake-stack",
    name: "Banana Walnut Pancake Stack",
    price: "$189",
    oldPrice: "$240",
    rating: "★★★★★",
    image: pancake,
    description:
      "Fluffy homemade pancakes layered with fresh banana slices, roasted walnuts, maple syrup, and whipped cream. A perfect breakfast or dessert treat.",
    highlights: [
      {
        title: "Organic Bananas",
        subtitle: "Naturally sweet and fresh",
      },
      {
        title: "Roasted Walnuts",
        subtitle: "Crunchy & full of flavor",
      },
      {
        title: "Made to Order",
        subtitle: "Served warm every time",
      },
    ],
    galleryItems: [
      { image: pancake, imageAlt: "Pancake with maple syrup" },
      { image: pancake, imageAlt: "Banana walnut pancakes" },
      { image: pancake, imageAlt: "Breakfast pancake stack" },
    ],
    reviews: {
      count: 320,
      items: [
        {
          name: "Olivia Green",
          text: "The pancakes were incredibly fluffy and fresh.",
        },
        {
          name: "James Miller",
          text: "Loved the banana and walnut combination.",
        },
        {
          name: "Sophia Adams",
          text: "The maple syrup completed the whole experience.",
        },
        {
          name: "Benjamin Lee",
          text: "Perfect weekend breakfast!",
        },
        {
          name: "Chloe Martin",
          text: "Generous portions and fantastic flavor.",
        },
        {
          name: "Lucas White",
          text: "My kids absolutely loved these pancakes.",
        },
      ],
    },
  },

  {
    id: 3,
    slug: "citrus-orange-cream-cake",
    name: "Citrus Orange Cream Cake",
    price: "$345",
    oldPrice: "$420",
    rating: "★★★★☆",
    image: orangeCake,
    description:
      "A light vanilla sponge infused with fresh orange zest, layered with smooth citrus cream, and decorated with juicy orange slices for a refreshing finish.",
    highlights: [
      {
        title: "Fresh Citrus",
        subtitle: "Made with real oranges",
      },
      {
        title: "Light Texture",
        subtitle: "Soft and airy sponge",
      },
      {
        title: "Refreshing Taste",
        subtitle: "Perfect for summer",
      },
    ],
    galleryItems: [
      { image: orangeCake, imageAlt: "Orange cream cake" },
      { image: orangeCake, imageAlt: "Fresh orange topping" },
      { image: orangeCake, imageAlt: "Slice of citrus cake" },
    ],
    reviews: {
      count: 410,
      items: [
        {
          name: "Grace Walker",
          text: "The orange flavor is fresh and perfectly balanced.",
        },
        {
          name: "Henry Scott",
          text: "Very light cake—not too sweet.",
        },
        {
          name: "Ella Brooks",
          text: "Beautiful presentation and delicious taste.",
        },
        {
          name: "Jack Evans",
          text: "One of the freshest cakes I've ever had.",
        },
        {
          name: "Mia Cooper",
          text: "Great choice for afternoon tea.",
        },
        {
          name: "Noah Turner",
          text: "Loved the citrus cream filling.",
        },
      ],
    },
  },

  {
    id: 4,
    slug: "fresh-berry-celebration-cake",
    name: "Fresh Berry Celebration Cake",
    price: "$430",
    oldPrice: "$520",
    rating: "★★★★★",
    image: fruitCake,
    description:
      "A soft vanilla sponge layered with whipped cream and seasonal berries, finished with strawberries, blueberries, and raspberries for a colorful celebration.",
    highlights: [
      {
        title: "Seasonal Fruits",
        subtitle: "Picked for maximum freshness",
      },
      {
        title: "Whipped Cream",
        subtitle: "Smooth & silky texture",
      },
      {
        title: "Party Ready",
        subtitle: "Perfect for every occasion",
      },
    ],
    galleryItems: [
      { image: fruitCake, imageAlt: "Berry celebration cake" },
      { image: fruitCake, imageAlt: "Fresh fruit topping" },
      { image: fruitCake, imageAlt: "Vanilla berry cake slice" },
    ],
    reviews: {
      count: 610,
      items: [
        {
          name: "Emily Davis",
          text: "The berries tasted incredibly fresh.",
        },
        {
          name: "William Harris",
          text: "Perfect cake for our anniversary celebration.",
        },
        {
          name: "Ava Robinson",
          text: "Beautiful colors and wonderful flavor.",
        },
        {
          name: "Michael Young",
          text: "Everyone at the party loved it.",
        },
        {
          name: "Charlotte Hall",
          text: "Light, creamy, and not overly sweet.",
        },
        {
          name: "Ethan King",
          text: "This has become my favorite fruit cake.",
        },
      ],
    },
  },
];