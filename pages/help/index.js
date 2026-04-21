import { useTranslation } from "@/lib/i18n/useTranslation";

const Help = () => {
  const t = useTranslation();
  return (
    <>
      <div className="grid grid-cols-3 m-auto md:w-3/4 w-96  pb-1">
        <div></div>
        <div className="text-center font-bold mt-2">
          {t.help.title}
        </div>
        <div></div>
      </div>
      <div className="card m-auto md:w-3/4 w-96 mt-10">
        <div className="card-body">
          <div className="collapse collapse-plus bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">
              <kbd className="kbd">1</kbd> {t.help.q1}
            </div>
            <div className="collapse-content">
              <p>
                {t.help.a1}
              </p>
            </div>
          </div>
          <div className="collapse collapse-plus bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">
              <kbd className="kbd">2</kbd> {t.help.q2}
            </div>
            <div className="collapse-content">
              <p>
                {t.help.a2}
              </p>
            </div>
          </div>
          <div className="collapse collapse-plus bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">
              <kbd className="kbd">2</kbd> {t.help.q3}
            </div>
            <div className="collapse-content">
              <p>
                {t.help.a3}
              </p>
            </div>
          </div>
          <div className="collapse collapse-plus bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">
              <kbd className="kbd">2</kbd> {t.help.q4}
            </div>
            <div className="collapse-content">
              <p>
                {t.help.a4}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Help;
