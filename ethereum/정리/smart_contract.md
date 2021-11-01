# Smart Contract

#### 정의

블록체인 상에서 동작하는 컴퓨터 코드

개발자가 작성한 코드가 블록체인의 블록 어딘가에 존재하고 사용자들은 해당 코드에 접근하여 실행할 수 있다



#### 장점

코드의 내용 전체가 블록에 기록되기 때문에 조작 불가. 코딩된 내용에 따라 프로그램이 동작하기 때문에 딱딱 정해진 내용을 실행하는데 용이



#### 만드는 순서

1.  스마트 컨트랙트 코딩

2.  구현한 소스 코드를 컴파일 (remix 등)

3.  배포

    스마트 컨트랙트를 배포???

    -  컴파일된 EVM 코드를 하나의 트랜잭션처럼 블락에 추가시켜 블락체인에 등록시키는 작업!!
    -  컴파일 -> 바이트코드 -> ABI 취득 -> ABI로부터 컨트랙트 객체 생성 -> 트랜잭션 생성 후 블락에 추가 (당연히 채굴자가 채굴해야 블락에 포함됨!)
    -  이 때 채굴되서 블록에 기록되면 비로소 우리가 생성한 스마트 컨트랙트에 접근할 수 있는 주소가 생성된다!!



#### Geth

Go-ethereum으로 클라이언트 기능을 하기 위한 프로그램

>  클라이언트: 이더리움 블락체인에 연결하는 노드들. 즉 블락체인에 참여하는 노드
>
>  하는 역할?? 블락체인에 연결되어 트랜잭션을 발생시키고 검증하는 역할

이거 해보기



#### 네트워크

1.  Main net
2.  test net
    -  요즘에는 사람이 많아져서 각 테스트 넷 마다 사용할 수 있는 ether를 구하는게 힘들어지고 있음
3.  local net
    -  처음하기에는 이게 제일 무난. 나만 사용가능



사용자는 이더리움 블락체인 데이터를 가지지 않음. (이걸 다 로컬에 다운받고 싱크 맞추고... 개오바)

따라서 웹 브라우저나 ssh 같은 걸로 접속







## EVM

누구나 접근할 수 있는 거대 컴퓨터

고급언어(solidity)가 실행될 수 있게 byte code 로 변환해주는 가상머신

공짜는 아님! 만약 공짜라면 누구나 접근해서 이상한 코드들도 만들어 망칠 수 있음. 따라서 비용(실제 트랜잭션을 실행하는데 필요한)을 지불해야함!!(Gas)

가스를 사용하면 Ddos 공격이나 악의적인 코드를 방지할 수 있다.

>  여기서 gas는 ether와 같은 화폐가 아님!! 일의 단위!!
>
>  즉 트랜잭션 실행에 필요한 gas X 1 Gas 비용 = ether. 이더의 가격은 매번 바뀌기 때문에 이걸 고려해서 gas 비용을 책정함.
>
>  트랜잭션 수수료(gas limit * gas price)
>
>  트랜잭션에서 처리된 byte 만큼 특정 양의 가스를 차감!
>
>  만약 송신 계정에 트랜잭션을 완료할 수 있을 만큼의 gas price가 충분하지 않으면 모든 트랜잭션이 Rollback! 그러나 수수료는 채굴자에게 지불되고 환불되지 않음
>
>  트랜잭션을 만든 주체자가 gas limit을 생성할 수 있음. 그러면 채굴자들이 높은 gas limit을 보고 수수료가 높겠다고 생각해 우선으로 처리할 수 있음



#### 계좌

이더리움에는 2가지 계좌가 존재

1.  External Owner Accounts(EOA)
    1.  that are controlled by public-private key pairs
2.  Contract Accounts(CA)
    1.  It is controlled by the code stored together with the account

>  l ether = $10**18$ wei = 10 ** 9Gwei



**solidity**

**용어정리**

-  상태변수
   -  블록체인 상에 영원히 저장되는 값을 가진다
-  함수
   -  스마트 컨트랙트에서 실행 가능
   -  (해당 변수의 상태나 값을 바꿀 때마다 트랜잭션은 이더를 소비함!! Calls 를 통해 이더의 소비 없이 블록체인을 호출할 수도 있는데 이는 변화를 무시하기 때문)
-  이벤트
   -  이벤트가 호출되면 이벤트로 전달되는 값이 트랜잭션 로그에 쓰여짐.
-  구조체(struct)
-  매핑



EVM은 32bytes의 단어 크기를 가지고 있어서 32바이트의 청크 데이터를 다루는데 최적화돼있다.

만약 32바이트가 아닐 경우 더 많은 작업과 함께 바이트코드를 생성해야하며 이는 보다 높은 가스 비용을 초래한다.



변수 저장은 어떻게??

EVM에서는 3가지의 data-area가 존재(storage, memory, stack)

보통 RAM에 저장되지만 솔리디티는 `메모리` 와 `스토리지(파일)` 크게 2가지!!

-  스토리지: 상태 변수(contract에 포함된 변수), 함수 내 로컬 변수 => 블록체인 상에 저장됨. 즉 가스 비용이 발생함!! 따라서 사용에 주의..
   -  모든 account에 존재하는 key(256bit)-value(256bit) 저장소
-  메모리: 함수의 매개 변수, 함수의 리턴값
   -  메모리에 저장된 값을 읽을 때는 256bits(word)만큼만 읽을 수 있고 쓸 때는 8bit or 256 bits wide 임



크게 두가지 변수타입이 존재

-  

1.  복합 데이터 타입 (문자열(=> 동적크기의 UTF-8 인코딩된 문자열), 구조체, 배열(동적 크기의 바이트 배열)) => 값 타입이 아님!!
    1.  즉 , 참조타입이며 항상 256비트에 들어맞지 않는 타입!! => 얘를 복사하는 건 비싼 연산이므로 복합 타입을 메모리(지속성이 없음)와 스토리지(상태 변수가 저장되는 곳) 중 어디에 저장할 지를 생각해야한다.

2.  기본 타입 (boolean, integers)

```solidity
contract Sample{
  function Sample{
    uint24[3] memory myArray3= [1, 2, 99999];
  }
} 
// 위와 같이 보통 함수의 로컬 변수는 스토리지에 저장되는데 memory 키워드를 사용하면 메모리에 저장된다!

contract Sample{
	// 아래 2개는 상태변수. 클래스로 따지면 멤버변수!!
  int[] myArray = [0, 0];
  string myString= "Solidity";

  function Sample(uint index, int value){
    myArray[index] = value;
    int[] myArray2 = myArray;
    uint24[3] memory myArray3= [1, 2, 9999];	// uint24[3] myArray3 = [1, 2, 999] 만약 이렇게 됐다면 배열(함수 내 로컬변수)은 메모리 값이고 myArray []는 함수의 매개변수로 들어온 값이 저장됐으므로 스토리지이다! 그래서 저렇게 하면 메모리에 있는 값을 스토리지에 넣는 것이므로 에러가 발생하는데 memory 키워드를 사용했기 때문에 ㄱㅊ
    uint8[2] myArray4= [1,2];
    
    string myString2= myString;
    string memory myString3= "ABCDE";
    myString3= "XYZ";
    string myString4= "Example";
  }
}
```

-  스토리지에 저장된 기본 타입 변수와 메모리에 저장된 기본 타입 변수간의 대입은 복사본이 생성되어 대입됩니다. 그러나 메모리에 저장되어 있는 복합 데이터 타입을 메모리에 있는 다른 복합 데이터 타입 변수에 대입할 때는 복사본이 만들어지 않습니다.
-  상태 변수는 항상 스토리지에 저장되는데, 상태 변수간의 대입은 항상 복사본을 생성하여 대입됩니다.
-  메모리에 저장된 복합 데이터 타입의 값을 로컬 변수에 대입할 수 없습니다. 이 경우가 위에서 살펴본 배열과 문자열에서 컴파일 에러를 발생한 경우입니다. 즉 메모리에 있는 배열 리터럴, 문자열 리터럴을 로컬 변수에 대입하려 했기 때문에 컴파일 에러가 발생한 것입니다.
-  상태 변수를 로컬 변수에 대입하는 경우는 복사본이 생성되는 것이 아니라, 로컬 변수가 상태 변수의 포인터가 됩니다. 따라서 로컬 변수를 이용하여 값을 변경하면, 상태 변수의 값도 변경되는 것이죠.



#### 몇 가지 문법

1.  mapping (string => FileDetails) files.  // files라는 map 객체를 생성한다고 이해하면 됨(키: string, value: FileDetails)

```solidity
pragma solidity ^0.4.0;

contract Proof
{
    struct FileDetails
    {
        uint timestamp;
        string owner;
    }
    mapping (string => FileDetails) files;
    event logFileAddedStatus(bool status, uint timestamp, string owner, string fileHash);
    
    //this is used to store the owner of file at the block
    function set(string owner, string fileHash) public
    {
        if(files[fileHash].timestamp == 0)
        {
            files[fileHash] = FileDetails(block.timestamp, owner);
            logFileAddedStatus(true, block.timestamp, owner, fileHash);
        }
        else
        {
            logFileAddedStatus(false, block.timestamp, owner, fileHash);
        }
    }
    //this is used to get file information
    function get(string fileHash) public returns (uint timestamp, string owner)
    {
        return (files[fileHash].timestamp, files[fileHash].owner);
    }
```

2.  Enums

    -  solidity 에서 사용자 정의 타입을 만드는 방법

3.  함수 타입

    1.  ```solidity
        function (<parameter types>) {internal|external} [pure|constant|view|payable] [returns (<return types>)]
        ```

    2.  



build artifacts: 컨트랙트의 함수와 아키텍처를 표현함.



```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract SimpleStorage {
    uint storedData;

    // modify variable
    function set(uint x) public {
        storedData = x;
    }

    function get() public view returns (uint){
        return storedData;
    }
}
```



함수 정의

```solidity
// return 값이 없을 때
function 이름() <public|private|internal|external> {
	내용~~
}

// 파라미터는 있고 리턴은 없을 때 
function 이름(uint256 _value) public {
	a = _value;
} 

// 파라미터, 리턴 둘 다 있을 떄
function 이름(uint256 _value) public returns(uint256){
  a = _value;
  return a;
} 
```



**data type**

-  data type
   -  Bool
   -  bytes 1 ~ 32
   -  address: 
   -  int vs uint
-  reference type
   -  string ,Arrays, struct
-  mapping type

희안하게 `string` 은 참조임!

```solidity
// 아래와 같은 경우 _str은 참조타입인데 함수의 파라미터는 memory에 저장되므로 저렇게 memory라는 키워드를 입력해줘야한다.
function get_string(string memory _str) public pure returns(uint256 memory){}

// 이건 어차피 uint는 기본 데이터 타입이기 때문에 memeory를 안써줘도 괜찮
function temp(uint256 _a) public pure returns(uint256){}
```





**접근 제한자**

Public => 오픈 돼있어 아무곳이나 접근가능

External => 모든 곳에서 접근 가능하나 external이 정의된 자기자신 컨트랙 내에서 접근 불가. 즉 외부에서는 접근 가능

private => 오직 프라이빗이 정의된 자기 컨트랙 내에서만 가능

internal => 프라이빗처럼 오직internal 이 정의된 자기 컨트랙에서만 가능하고 internal 이 정의된 컨트랙을 상속



**pure vs view**

-  pure
   -  순수함수라는 의미인듯
   -  함수 밖의 변수들을 읽지도 못하고 변경도 불가능
-  view
   -  함수 밖의 변수들을 읽을 수 있으나 변경 불가능

만약 둘 다 명시를 안한다면 function 밖의 변수들을 읽어서, 변경해야함.



**저장영역**

-  Storage	
   -  대부분의 변수 함수들이 저장되며 영속적으로 저장이 되어 가스 비용이 비쌈
-  메모리
   -  함수의 파라미터, 리턴값, 레퍼런스 타입이 주로 저장됨
   -  영속적으로 저장되지 않고 함수내에서만 유효해서 stroage보다는 가스 비용이 쌈
-  collData
   -  주로 external function 의 파라미터에서 사용됨
-  stack
   -  EVM에서 stack data를 관리할 때 쓰는 영역인데 1기가로 제한적



```solidity
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract A {
    
    uint256 public a = 5;
    
    function change(uint256 _value) public {
        a = _value;
    }
}

contract B {
    A instance = new A();
    
    function get_A() public view returns(uint256){
        return instance.a();
    }
    
    function change_A(uint256 _value) public {
        instance.change(_value);
    }
}
```



```solidity
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract A {
    
    string public name;
    uint256 public age;
    
    constructor(string memory _name, uint256 _age){
        name = _name;
        age = _age;
    }
    
    function change(string memory _name, uint256 _age) public {
        name = _name;
        age = _age;
    }
}

contract B {
    A instance = new A('a', 12);
    
    function get() public view returns(string memory, uint256) {
        return (instance.name(), instance.age());
    }
    
    function change(string memory _name, uint256 _age) public {
        instance.change(_name, _age);
    }
}

// smart contract 자체를 복사하는 거기 때문에 gas 소모가 엄청남..
```





#### ABI

컴파일 하면 생성되는 파일

ABi(Application Binary Interface)는 사용자 액션의 JSON과 Binary 표현 간에 어떻게 변환해야 하는지 JSON 형식으로 기술한 것!!

즉 언어나 플랫폼에 대한 의존성 없이 어디서나 해당 인터페이스에 대한 정보를 제공할 수 있게끔 하는 형태!!!





컨트랙트가 배포될 때 비용 발생(내용이 opcode로 변환되면서 소모되는 비용)



## 문법

#### 함수 접근자

상태변수는 디폴트로 internal 선언

1.  public

    -  default 값. 

2.  private

    -  컨트랙트 외부에서는 호출 불가능

3.  external

    -  external을 붙인 함수는 컨트랙트 외부에서만 호출 가능!!

4.  internal

    -  internal을 붙인 함수는 상속을 받은 컨트랙트(자식 컨트랙트)에서는 함수를 사용할 수 있게 한다.

    -  ```solidity
       // SPDX-License-Identifier: GPL-3.0
       
       pragma solidity >=0.7.0 <0.9.0;
       
       contract Sandwich {
           uint private sandwichesEaten = 0;
           
           function eat() internal {
               sandwichesEaten++;
           }
       }
       
       contract BLT is Sandwich {
           uint private baconSandwichedEaten = 0;
           
           function eatWithBacon() public {
               baconSandwichedEaten++;
               eat();
           }
       }
       ```



#### 함수 제어자

컨트랙트 변수를 읽고 쓰는지 여부에 따라 제어자를 지정

1.  View: 변수를 읽기만 할 때 (상태 변화 X)
2.  Pure: 변수를 읽지도 않고 쓰지도 않을 때. 즉 수정을 하지 않는 함수

>  외부에서 호출되는 View 와 pure 함수만큼은 무료로 실행 가능
>
>  따라서 외부로부터 컨트랙트 데이터를 읽기만 하는 함수가 있다면 external view 를 활용해서 수수료를 절감해야한다.

1.  public: 어느곳이나 접근 가능
2.  Private: 컨트랙트 내에서만 접근 가능
3.  Payable: 함수가 호출될 경우 이더를 전송. 함수가 이더를 받을 수 있게 함.



#### require

require 는 조건이 참이면 함수를 실행하고, 참이 아니면 함수를 실행하지 않고 에러를 출력합니다.



#### keccak256

보안이 생명인 블록체인에서 `keccak256` 이라는 내장 해시 함수를 가지고 있다.

보통 시각 등 추측할 수 있는 값을 난수의 시드로 삼는데 이 함수는 충돌날 확률이 희박한 안전한 난수를 생성해준다고 함.

솔리디티에서는 이걸 사용하는 걸 추천



#### 이벤트

솔리디티 => DAPP의 로직을 담당

트랜잭션의 계약 내용과 트랜잭션 내역을 보여줘야하기 때문에 frontend 필요! 

프론트엔드에 데이터를 넘겨주기 위해 `이벤트`를 사용함

```solidity
// onNewTransaction 이라는 이벤트를 정의합니다.
event onNewTransaction(uint id, uint data);

function add(uint id,  uint data) public returns (uint) {
    // add 함수가 실행되면 onNewTransaction 이벤트가 호출됩니다.
    onNewTransaction(error, result);
    return data;
}
```

```solidity
// 프론트엔드
Contract.onNewTransaction((err, res) => {
    console.log(res.id, res.data);
})
```





#### Storage vs memory

https://ethereum.stackexchange.com/questions/1232/difference-between-memory-and-storage/1711#1711

https://medium.com/loom-network-korean/%EC%9D%B4%EB%8D%94%EB%A6%AC%EC%9B%80-%EC%86%94%EB%A6%AC%EB%94%94%ED%8B%B0-%EB%A9%94%EB%AA%A8%EB%A6%AC-vs-%EC%8A%A4%ED%86%A0%EB%A6%AC%EC%A7%80-%EA%B5%AC%EC%A1%B0%EC%B2%B4-%EB%82%B4%EB%B6%80%EC%9D%98-%EB%B0%B0%EC%97%B4%EC%9D%84-%EC%B4%88%EA%B8%B0%ED%99%94-%ED%95%98%EB%8A%94-%EB%B0%A9%EB%B2%95-ff2df75eac68

변수를 저장할 수 있는 공간



일단 변수 타입의 종류 2가지

솔리디티는 코드를 실행할 때마다 가스(돈)가 들기 때문에 최적화가 굉장히 중요!!

-  Complex Type => string, struct, array
-  Basic Type => boolean, integer, address, bytes(string은 최적화가 안돼있어서 가스 아끼려면 많이많이 사용하는 게 좋다고 한다.)

대부분의 경우 솔리디티가 알아서 구분해주지만 

1.  strorage

    -  블록체인 상에 영구적으로 저장된다!
    -  상태 변수들
    -  Key-value 각각 32bytes

2.  memory

    -  임시적으로 저장되는 변수로 외부 호출이 일어날 때마다 초기화된다.
    -  함수 내에 선언된 변수들, 함수의 리턴값 매개변수(정확하게는 call data)

    ```solidity
    contract C {
        uint[20] public x;
    
        function f() public {
            h(x);
            g(x);
        }
    
    		// 복사본 전송. x는 변경 안됨
        function g(uint[20] y) internal pure {
            y[2] = 3;
        }
    
    		// 참조로 전송(storage 니깐). 즉 x가 변경됨
        function h(uint[20] storage y) internal {
            y[2] = 4;
        }
    }
    ```

    ```solidity
    // SPDX-License-Identifier: GPL-3.0
    
    //https://opentutorials.org/course/2869/19664
    
    pragma solidity >=0.7.0 <0.9.0;
    
    contract Simple {
        int[] myArray = [0, 0];
        string myString = 'Solidity';
        
        function sample(uint index, int value) public {
            myArray[index] = value;
            int[] storage myArray2 = myArray;		// 상태변수를 로컬 변수에 대입하는 경우
            // 함수 내에 만들어진 배열 리터럴은 메모리에 저장(중요). uint24[3] myArray3는 스토리지에 저장됨(왜냐면 함수내에 선언) 따라서 myArray3를 메모리에 저장하겠다고 해줘야 에러가 발생하지 않는다. 문자열도 마찬가지 => 이거 불확실함.
            uint24[3] memory myArray3 = [1, 2, 99];	// 메모리에 저장된 복합데이터타입([1, 2, 99])를 로컬 변수에 대입하는 건 불가능. 에러 발생
            
            uint8[2] myArray4 = [1, 2];
        }
    }
    ```

    즉 리터럴(배열, 문자열)은 함수 내부에 나타나면 메모리에 저장된다.

    Calldata => memory와 거의 비슷하게 동작함. 주로 함수의 매개변수(리턴값 제외)가 저장되는 위치

    상태변수간의 대입은 항상 복사본이 생성되서 대입된다.

    상태변수를 로컬 변수에 대입하는 경우는 복사본이 생성되는게 아니라 로컬 변수가 상태 변수의 포인터가 되는것!!





```solidity
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract MyContract {
    struct Student {
        string studentName;
        string gender;
        uint age;
    }
    
    mapping(uint256 => Student) studentInfo;
    
    function setStudentInfo(uint _studentId, string memory _name, string memory _gender, uint _age) public {
        Student storage student= studentInfo[_studentId];
        
        student.studentName = _name;
        student.gender = _gender;
        student.age = _age;
    }
    
    function getStudentInfo(uint256 _studentId) public view returns (string memory, string memory, uint) {
        return (studentInfo[_studentId].studentName, studentInfo[_studentId].gender, studentInfo[_studentId].age);
    }
}
```





### 가스가 소모되는 경우

1.  스마트 컨트랙트를 배포할 때
2.  state variable을 변화시킬 때
3.  다른 계정으로 송금할 때

