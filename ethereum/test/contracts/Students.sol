// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Student_Contract {
    uint public curr = 0;

    struct Student {
        uint id;
        string name;
        uint age;
        bool gender;
    }

    mapping(uint => Student) studentInfo;

    function setStudent(uint _studentId, string memory _name, uint _age, bool _gender) public {
        curr++;
        Student storage student = studentInfo[_studentId];

        student.name = _name;
        student.age = _age;
        student.gender = _gender;
    }

    function getStudent(uint _id) public view returns (string memory, uint, bool) {
        return (
            studentInfo[_id].name,
            studentInfo[_id].age,
            studentInfo[_id].gender
        );
    }
}