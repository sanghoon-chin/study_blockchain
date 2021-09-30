// To do: 타입 잡기
// ====================================================================================================
// enum EnumMsgType {
//     Transaction = 'transaction', 
//     Blockchain = 'blockchain', 
//     Block = 'block', 
//     RequestBlockchain = 'requestBlockchain', 
//     CreateNewTx = 'createNewTx'
// }
// type DataFormatByMsgType<T> = T extends EnumMsgType.Transaction ? {} :
//                                                     T extends EnumMsgType.Blockchain ? Blockchain :
//                                                     T extends EnumMsgType.Block ? {} :
//                                                     T extends EnumMsgType.RequestBlockchain ? {} :
//                                                     T extends EnumMsgType.CreateNewTx ? {} : never;

// type DataFormat<T = any> = {
//     type: T;
//     data: DataFormatByMsgType<T>
// }

// let foo: DataFormat<EnumMsgType.Blockchain> 

// Typescript advanced type "type guard"
// function isBlockchainType(data: DataFormat): data is DataFormat<EnumMsgType.Blockchain> {
//     return data.type === EnumMsgType.Blockchain
// }
// ====================================================================================================
