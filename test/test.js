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


        let asd = true;
        try {
            const a = await td.testRequire();
            console.log(a)
            asd = false;
        } catch(e) {
        }

        assert.equal(true,asd,'test require')
        asd = true;
        try {
            const b = await td.testAssert();
            console.log(b)
            asd = false
        } catch(e) {
        }
        assert.equal(true,asd,'test assert')

    })

    it('test errors', async () => {
        const td = await Test.deployed();

        const r = await td.testRequire()
        const a = await td.testAssert()

        assert.equal(true, r, 'req not true')
        assert.equal(true, a, 'ass not true')
    })

})