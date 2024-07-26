import { Asset, assetOf, AssetSelector } from '@lib/component';
import { d } from '@lib/shared';

const fundingRates = {
  historicalFunding: [
    {
      market: 'BTC-USD',
      rate: '0.0000185681',
      price: '67558.2166225649',
      effectiveAt: '2024-07-22T12:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000035825',
      price: '67431.6767812707',
      effectiveAt: '2024-07-22T11:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000178935',
      price: '67404.8095475882',
      effectiveAt: '2024-07-22T10:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000122815',
      price: '67099.8169993982',
      effectiveAt: '2024-07-22T09:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000101819',
      price: '67283.0000007525',
      effectiveAt: '2024-07-22T08:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000111564',
      price: '67368.8760004006',
      effectiveAt: '2024-07-22T07:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000178184',
      price: '67636.9121088646',
      effectiveAt: '2024-07-22T06:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000309052',
      price: '67933.5739999078',
      effectiveAt: '2024-07-22T05:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000296258',
      price: '67919.1670008004',
      effectiveAt: '2024-07-22T04:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000282954',
      price: '68183.8851468638',
      effectiveAt: '2024-07-22T03:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000303807',
      price: '67839.7689992562',
      effectiveAt: '2024-07-22T02:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000498694',
      price: '68209.3223556876',
      effectiveAt: '2024-07-22T01:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000392593',
      price: '68169.7129993699',
      effectiveAt: '2024-07-22T00:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000381834',
      price: '68023.0999994092',
      effectiveAt: '2024-07-21T23:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000227148',
      price: '68209.1000000946',
      effectiveAt: '2024-07-21T22:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000124948',
      price: '67726.4904184267',
      effectiveAt: '2024-07-21T21:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000139531',
      price: '67454.6599993482',
      effectiveAt: '2024-07-21T20:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000093376',
      price: '66894.2399998195',
      effectiveAt: '2024-07-21T19:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000142481',
      price: '66666.0000011325',
      effectiveAt: '2024-07-21T18:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000169072',
      price: '67550.6368465722',
      effectiveAt: '2024-07-21T17:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000161452',
      price: '67201.0000003502',
      effectiveAt: '2024-07-21T16:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000149475',
      price: '67319.1380011849',
      effectiveAt: '2024-07-21T15:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000123604',
      price: '66782.4900010601',
      effectiveAt: '2024-07-21T14:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000195606',
      price: '66960.5885259807',
      effectiveAt: '2024-07-21T13:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000112265',
      price: '66900.3127305768',
      effectiveAt: '2024-07-21T12:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000049278',
      price: '66832.6659989543',
      effectiveAt: '2024-07-21T11:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000137137',
      price: '67000.9159995243',
      effectiveAt: '2024-07-21T10:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000125476',
      price: '66822.0879998989',
      effectiveAt: '2024-07-21T09:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000091245',
      price: '66714.0537267551',
      effectiveAt: '2024-07-21T08:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000097095',
      price: '66744.9999996461',
      effectiveAt: '2024-07-21T07:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000143662',
      price: '67071.4799989946',
      effectiveAt: '2024-07-21T06:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000121576',
      price: '67066.8594865128',
      effectiveAt: '2024-07-21T05:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000114805',
      price: '67199.0199992433',
      effectiveAt: '2024-07-21T04:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000149993',
      price: '67312.9608388990',
      effectiveAt: '2024-07-21T03:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000137876',
      price: '67311.8830006570',
      effectiveAt: '2024-07-21T02:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000105787',
      price: '67099.0867679939',
      effectiveAt: '2024-07-21T01:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000136011',
      price: '67167.3992858268',
      effectiveAt: '2024-07-21T00:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000107454',
      price: '67167.3992858268',
      effectiveAt: '2024-07-20T23:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000046087',
      price: '67133.8599990122',
      effectiveAt: '2024-07-20T22:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000088832',
      price: '67383.0000008456',
      effectiveAt: '2024-07-20T21:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000109757',
      price: '67260.8430008404',
      effectiveAt: '2024-07-20T20:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000102561',
      price: '67512.7639994025',
      effectiveAt: '2024-07-20T19:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000118206',
      price: '67432.9999997281',
      effectiveAt: '2024-07-20T18:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000095273',
      price: '66850.6999989040',
      effectiveAt: '2024-07-20T17:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000093178',
      price: '66804.7114019282',
      effectiveAt: '2024-07-20T16:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000130036',
      price: '66599.6268484741',
      effectiveAt: '2024-07-20T15:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000107599',
      price: '66571.6399997473',
      effectiveAt: '2024-07-20T14:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000064790',
      price: '66511.9999996386',
      effectiveAt: '2024-07-20T13:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000160884',
      price: '66522.5985064171',
      effectiveAt: '2024-07-20T12:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000167072',
      price: '66552.0999999717',
      effectiveAt: '2024-07-20T11:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000084449',
      price: '66637.7119999379',
      effectiveAt: '2024-07-20T10:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000036440',
      price: '66544.8600007221',
      effectiveAt: '2024-07-20T09:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000091890',
      price: '66621.0314864293',
      effectiveAt: '2024-07-20T08:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000116041',
      price: '66663.5100007989',
      effectiveAt: '2024-07-20T07:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000082246',
      price: '66569.0446272492',
      effectiveAt: '2024-07-20T06:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000069677',
      price: '66692.1689989977',
      effectiveAt: '2024-07-20T05:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000131475',
      price: '66663.4708014317',
      effectiveAt: '2024-07-20T04:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000144468',
      price: '66614.5200002939',
      effectiveAt: '2024-07-20T03:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000106719',
      price: '66373.0000006035',
      effectiveAt: '2024-07-20T02:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000144320',
      price: '66528.1699993648',
      effectiveAt: '2024-07-20T01:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000093522',
      price: '66709.9000001326',
      effectiveAt: '2024-07-20T00:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000119795',
      price: '66745.1149993576',
      effectiveAt: '2024-07-19T23:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000136028',
      price: '66945.0400001369',
      effectiveAt: '2024-07-19T22:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000167960',
      price: '66982.0400001481',
      effectiveAt: '2024-07-19T21:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000253254',
      price: '67271.7619989999',
      effectiveAt: '2024-07-19T20:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000087134',
      price: '66794.7859992273',
      effectiveAt: '2024-07-19T19:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000134511',
      price: '66824.3400007486',
      effectiveAt: '2024-07-19T18:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000148785',
      price: '66396.1800001562',
      effectiveAt: '2024-07-19T17:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000167491',
      price: '65803.3700007945',
      effectiveAt: '2024-07-19T16:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000087706',
      price: '65743.2101387531',
      effectiveAt: '2024-07-19T15:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000169374',
      price: '65325.9680001065',
      effectiveAt: '2024-07-19T14:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000063911',
      price: '64390.0000001304',
      effectiveAt: '2024-07-19T13:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000087055',
      price: '64006.3159167767',
      effectiveAt: '2024-07-19T12:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000212268',
      price: '64024.3200003169',
      effectiveAt: '2024-07-19T11:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000128742',
      price: '63698.2202250510',
      effectiveAt: '2024-07-19T10:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000092150',
      price: '63777.1910009906',
      effectiveAt: '2024-07-19T09:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000180602',
      price: '63741.0565628670',
      effectiveAt: '2024-07-19T08:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000132300',
      price: '64233.4069567733',
      effectiveAt: '2024-07-19T07:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000125252',
      price: '64208.5332353599',
      effectiveAt: '2024-07-19T06:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000123002',
      price: '64168.0300002918',
      effectiveAt: '2024-07-19T05:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000175249',
      price: '64297.3781609908',
      effectiveAt: '2024-07-19T04:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000145824',
      price: '63778.6130001768',
      effectiveAt: '2024-07-19T03:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000179231',
      price: '63800.7299997844',
      effectiveAt: '2024-07-19T02:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000076870',
      price: '63570.9999990650',
      effectiveAt: '2024-07-19T01:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000183565',
      price: '63952.4929993786',
      effectiveAt: '2024-07-19T00:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000090484',
      price: '63995.9999988787',
      effectiveAt: '2024-07-18T23:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000129515',
      price: '63840.6600011513',
      effectiveAt: '2024-07-18T22:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000084023',
      price: '63739.7551164031',
      effectiveAt: '2024-07-18T21:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000083962',
      price: '63506.9400002249',
      effectiveAt: '2024-07-18T20:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000098535',
      price: '63588.9789997600',
      effectiveAt: '2024-07-18T19:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000066548',
      price: '63571.7809549533',
      effectiveAt: '2024-07-18T18:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000070215',
      price: '63843.4549979866',
      effectiveAt: '2024-07-18T17:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000135528',
      price: '63469.3769994192',
      effectiveAt: '2024-07-18T16:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000080528',
      price: '64055.7528799400',
      effectiveAt: '2024-07-18T15:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000082249',
      price: '64579.3860009871',
      effectiveAt: '2024-07-18T14:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000170956',
      price: '64842.0000006445',
      effectiveAt: '2024-07-18T13:00:00.000Z'
    },
    {
      market: 'BTC-USD',
      rate: '0.0000096260',
      price: '64686.6009989753',
      effectiveAt: '2024-07-18T12:00:00.000Z'
    }
  ]
};

describe(Asset.name, () => {
  test('apr', () => {
    const p = fundingRates.historicalFunding.reduce((agg, cur) => {
      agg += Number(cur.rate);

      return agg;
    }, 0);

    expect((0.13488751999999993 * 365) / 5).toEqual(1);
  });

  test('should construct a new asset', () => {
    const sut = new Asset('abc', 'xyz', 4);

    expect(sut.name).toEqual('abc');
    expect(sut.adapterName).toEqual('xyz');
    expect(sut.scale).toEqual(4);
    expect(sut.tickSize).toEqual(d(0.0001));
    expect(sut.floor(d(1.1234567))).toEqual(d(1.1234));
    expect(sut.ceil(d(1.1234567))).toEqual(d(1.1235));
    expect(sut.id).toEqual('xyz:abc');
  });

  test('should throw for missing asset name', () => {
    const fn = () => new Asset('xyz', '', 5);

    expect(fn).toThrowError();
  });

  test('should throw for missing adapter name', () => {
    const fn = () => new Asset('', 'xyz', 5);

    expect(fn).toThrowError();
  });
});

describe(AssetSelector.name, () => {
  test('should construct a new asset selector from unified string', () => {
    const sut = assetOf('xyz:abc');

    expect(sut.name).toEqual('abc');
    expect(sut.adapterName).toEqual('xyz');
    expect(sut.id).toEqual('xyz:abc');
  });

  test('should instantiate proper asset selector capital case', () => {
    const sut = assetOf('XYZ:ABC');

    expect(sut.name).toEqual('abc');
    expect(sut.adapterName).toEqual('xyz');
    expect(sut.id).toEqual('xyz:abc');
  });

  test('should throw invalid format message for missing separator', () => {
    const fn = () => assetOf('xyzabc');

    expect(fn).toThrowError();
  });

  test('should throw for multiple separators', () => {
    const fn = () => assetOf('xyz:abc:');

    expect(fn).toThrowError();
  });

  test('should throw for missing asset name', () => {
    const fn = () => assetOf('xyz:');

    expect(fn).toThrowError();
  });

  test('should throw for missing adapter name', () => {
    const fn = () => assetOf(':abc');

    expect(fn).toThrowError();
  });
});
