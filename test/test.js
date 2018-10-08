const Test = artifacts.require('Test.sol')


contract('Test', accounts => {
  console.dir(accounts, { colors: true})

    it('deploy Test contract', async () => {
        let td;
        try {
            td = await Test.deployed();
        } catch (e) {
            console.log(e.message);
        }
        

        const test = await td.test();
        // console.log(td)

        assert.equal(test, 1, 'first test')
    })

})