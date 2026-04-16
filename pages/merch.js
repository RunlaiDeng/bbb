import { useState } from "react";
import Image from "next/image";
import Head from "next/head";
import { useNotification } from "@/components/Context/notice";

const products = [
  {
    id: 1,
    name: "BBB Hat",
    price: 100000,
    image: "/merch/hat.png",
    description: "Stylish BBB hat for crypto enthusiasts",
    inStock: true,
  },
  {
    id: 2,
    name: "BBB Socks",
    price: 75000,
    image: "/merch/sock.png",
    description: "Comfortable BBB socks for everyday wear",
    inStock: true,
  },
];

const Merch = () => {
  const [cart, setCart] = useState([]);
  const { info } = useNotification();
  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  return (
    <>
      <Head>
        <title>BBB Merchandise | Shop</title>
        <meta name="description" content="Official BBB merchandise shop" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-green-100">
        {/* Header */}
        <div className="bg-green-600 text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center">
              BBB Merchandise Shop
            </h1>
            <p className="text-center mt-2">
              Official BBB merchandise for our community
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Products Section */}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-6 text-green-800">
                Available Products
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-base-200 rounded-lg shadow-lg overflow-hidden border border-base-300 hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-64 bg-primary/10">
                      <Image
                        src={product.image}
                        alt={product.name}
                        layout="fill"
                        objectFit="contain"
                        className="p-4"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-green-800">
                        {product.name}
                      </h3>
                      <p className="text-base-content/60 mt-2">
                        {product.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xl font-bold text-success">
                          {product.price} BBB
                        </span>
                        <button
                          onClick={() => addToCart(product)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Section */}
            <div className="w-full md:w-80 bg-base-200 p-6 rounded-lg shadow-lg h-fit sticky top-4 border border-base-300">
              <h2 className="text-xl font-semibold mb-4 text-green-800">
                Your Cart
              </h2>
              {cart.length === 0 ? (
                <p className="text-base-content/50">Your cart is empty</p>
              ) : (
                <>
                  <ul className="divide-y divide-green-100">
                    {cart.map((item, index) => (
                      <li
                        key={index}
                        className="py-3 flex justify-between items-center"
                      >
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-base-content/60">{item.price} BBB</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-primary/20">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{getTotalPrice()} BBB</span>
                    </div>
                    <button
                      className="w-full mt-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      onClick={() => {
                        info("Coming soon");
                      }}
                    >
                      Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Merch;
