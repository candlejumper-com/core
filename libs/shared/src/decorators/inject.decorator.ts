import "reflect-metadata";

export function Inject(target: any, key: string, parameterIndex: number){
  const paramMetadata = Reflect.getMetadata('param_decorator', target, key);
  var t = Reflect.getOwnMetadata("design:type", target, key);
  // this is the decorator factory, it sets up
  // the returned decorator function
  // console.log(1111, target, t, paramMetadata)
  // console.log(12122, target, key)
  // console.log(`${key} type: ${t.name}`);
  // return 2
  // return function (target: any) {
  // // return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  //   console.log(2342343434, target)
  //   // console.log(2342343434, target, propertyKey, descriptor)
  //   // this is the decorator
  //   // do something with 'target' and 'value'...
  // };

  return 2 as any
}

function logParam(target: any, methodKey: string, parameterIndex: number) {
  target.test = methodKey;
  // and parameterIndex says which parameter
}

// export function Inject(options) {
//   // this is the decorator factory, it sets up
//   // the returned decorator function
//   console.log(1111, options)

//   // return 2
//   return function (target: any) {
//   // return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//     console.log(2342343434, target)
//     // console.log(2342343434, target, propertyKey, descriptor)
//     // this is the decorator
//     // do something with 'target' and 'value'...
//   };
// }