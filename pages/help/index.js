const Help = () => {
  return (
    <>
      <div className="grid grid-cols-3 m-auto md:w-3/4 w-96  pb-1">
        <div></div>
        <div className="text-center font-bold mt-2">
          Frequently Asked Questions
        </div>
        <div></div>
      </div>
      <div className="card m-auto md:w-3/4 w-96 mt-10">
        <div className="card-body">
          <div className="collapse collapse-plus bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">
              <kbd className="kbd">1</kbd> What is farm ?
            </div>
            <div className="collapse-content">
              <p>
                Use your $BBB or tokens to buy farmers who can harvest tokens.
                tokens is liquid and can be swapped easily.
              </p>
            </div>
          </div>
          <div className="collapse collapse-plus bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">
              <kbd className="kbd">2</kbd> What is referral program ?
            </div>
            <div className="collapse-content">
              <p>
                A referral program is a marketing strategy where existing
                customers are rewarded for referring new customers. Refer
                friends to earn 10% of their mining rewards.
              </p>
            </div>
          </div>
          <div className="collapse collapse-plus bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">
              <kbd className="kbd">2</kbd> What is Stake ?
            </div>
            <div className="collapse-content">
              <p>
                Stake allows you to stake BBB to receive MBBB, and you can
                unstake MBBB to get BBB back. While holding MBBB, you will
                periodically receive various airdrops.
              </p>
            </div>
          </div>
          <div className="collapse collapse-plus bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">
              <kbd className="kbd">2</kbd> What is drop ?
            </div>
            <div className="collapse-content">
              <p>
                There are two types of airdrops: official airdrops and community
                airdrops. Official airdrops are distributed by the project team
                based on MBBB snapshots, while community airdrops can be created
                by anyone. Creating a community airdrop requires spending
                257,000 BBB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Help;
