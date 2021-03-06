import 'mocha'
import { FieldMap, FieldMapper, FieldMapLike } from '../src/index'
import { strictEqual, deepStrictEqual } from 'assert'

interface ShipDetailData extends FieldMapLike<'ShippingDetail__c'> {
  PartitionKey: string
  RowKey: string
  additional: number
}

const data: Array<ShipDetailData> = [
  {
    PartitionKey: 'ShippingDetail__c',
    RowKey: 'Order__c::orderId',
    fieldName: 'Order__c',
    propertyName: 'orderId',
    objectName: 'ShippingDetail__c',
    active: false,
    additional: 1
  },
  {
    PartitionKey: 'ShippingDetail__c',
    RowKey: 'Warehouse__c::warehouseId',
    fieldName: 'Warehouse__c',
    propertyName: 'warehouseId',
    objectName: 'ShippingDetail__c',
    active: false,
    additional: 2
  },
  {
    PartitionKey: 'ShippingDetail__c',
    RowKey: 'Warehouse__c::warehouseId',
    fieldName: 'Warehouse__r.Id',
    propertyName: 'warehouse.id',
    objectName: 'ShippingDetail__c',
    active: false,
    additional: 2
  }
]

describe('FieldMapper', () => {
  it('should ingest array of fields', () => {
    const myMapper = new FieldMapper(data)

    strictEqual(myMapper instanceof FieldMapper, true)
    strictEqual(myMapper.toTableRows().length, 0)

    myMapper.getFieldName('orderId')

    strictEqual(myMapper.toTableRows().length, 1)
    strictEqual(myMapper.toTableRows(true).length, 3)

    const json = JSON.stringify(myMapper)

    strictEqual(typeof json, 'string')

    const fieldPathSet = myMapper.getFieldPaths('ShippingDetail__c')
    const propertyPathSet = myMapper.getPropertyPaths('ShippingDetail__c')
    const emptyPathSet1 = myMapper.getFieldPaths('Bob_Loblaw')
    const emptyPathSet2 = myMapper.getPropertyPaths('Bob_Loblaw')

    strictEqual(fieldPathSet.size, 1)
    strictEqual(propertyPathSet.size, 1)
    strictEqual(emptyPathSet1.size, 0)
    strictEqual(emptyPathSet2.size, 0)
  })

  it('should handle all mapping data', () => {
    const myMapper = new FieldMapper(data)
    const orderMap = myMapper.getFieldMap('Order__c')
    const shipDetailMapper = myMapper.getObjectMap('ShippingDetail__c')
    const warehouseMap = shipDetailMapper.getFieldMap('Warehouse__c')
    const warehouseProp = shipDetailMapper.getPropertyName('Warehouse__c')

    orderMap.objectName = 'Dummy'

    strictEqual(orderMap instanceof FieldMap, true)
    strictEqual(orderMap, shipDetailMapper.getFieldMap('Order__c'))
    strictEqual(orderMap.modified, false)
    strictEqual(orderMap.objectName, 'ShippingDetail__c')
    strictEqual(orderMap.active, true)
    strictEqual(orderMap.modified, true)
    strictEqual(warehouseProp, 'warehouseId')
    strictEqual(warehouseMap.active, true)
    strictEqual(shipDetailMapper.setFieldMap(data[0]), undefined)
    strictEqual(orderMap.additional, 1)

    orderMap.fieldName = 'Dummy1'
    orderMap.propertyName = 'Dummy2'
    orderMap.additional = 3

    strictEqual(orderMap.fieldName, 'Dummy1')
    strictEqual(orderMap.propertyName, 'Dummy2')
    strictEqual(orderMap.additional, 3)

    orderMap.fieldName = 'Dummy1'
    orderMap.propertyName = 'Dummy2'
    orderMap.additional = 3

    warehouseMap.active = false

    deepStrictEqual(warehouseMap.toTableRow(), data[1])
  })
})
