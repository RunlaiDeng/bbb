import { useState, useMemo } from "react";
import Image from "next/image";
import Head from "next/head";
import { useNotification } from "@/components/Context/notice";
import { useTranslation } from "@/lib/i18n/useTranslation";

const Merch = () => {
  const t = useTranslation();
  const products = useMemo(
    () => [
      {
        id: 1,
        name: t.merch.hatName,
        price: 100000,
        image: "/merch/hat.png",
        description: t.merch.hatDesc,
        inStock: true,
      },
      {
        id: 2,
        name: t.merch.socksName,
        price: 75000,
        image: "/merch/sock.png",
        description: t.merch.socksDesc,
        inStock: true,
      },
    ],
    [t]
  );
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
        <title>{t.pageMeta.merchTitle}</title>
        <meta name="description" content={t.pageMeta.merchDescription} />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
        {/* Header */}
        <div className="bg-green-600 text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center">
              {t.pageMeta.merchH1}
            </h1>
            <p className="text-center mt-2">
              {t.pageMeta.merchSub}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Products Section */}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-6 text-green-800">
                {t.merch.availableProducts}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden border border-green-200 hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-64 bg-green-50">
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
                      <p className="text-gray-600 mt-2">
                        {product.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xl font-bold text-green-700">
                          {product.price} BBB
                        </span>
                        <button
                          onClick={() => addToCart(product)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          {t.merch.addToCart}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Section */}
            <div className="w-full md:w-80 bg-white p-6 rounded-lg shadow-lg h-fit sticky top-4 border border-green-200">
              <h2 className="text-xl font-semibold mb-4 text-green-800">
                {t.merch.yourCart}
              </h2>
              {cart.length === 0 ? (
                <p className="text-gray-500">{t.pageMeta.merchEmptyCart}</p>
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
                          <p className="text-gray-600">{item.price} BBB</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          {t.merch.remove}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-green-100">
                    <div className="flex justify-between font-semibold">
                      <span>{t.pageMeta.merchTotal}</span>
                      <span>{getTotalPrice()} BBB</span>
                    </div>
                    <button
                      className="w-full mt-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      onClick={() => {
                        info(t.merch.comingSoonToast);
                      }}
                    >
                      {t.merch.checkout}
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
