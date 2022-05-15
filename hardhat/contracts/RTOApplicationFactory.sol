//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./RTOApplication.sol";

error CallerIsNotOwner();
error ApplicationDoesntExist();
error ServiceAddressIsZero();

contract RTOApplicationFactory is AccessControl {
    bytes32 private constant OWNER = keccak256("OWNER");
    
    uint256 private s_applicationId;
    address private s_rtoRegistrationService;

    mapping(uint256 => address) private s_applications;


    event RTOApplicationIdChanged(uint256 indexed applicationId);
    event RTOApplicationCreated(uint256 indexed applicationId);
    event RTOApplicationSubmitted(uint256 indexed applicationId); 
    event RTORegistrationServiceChanged(address indexed rtoRegistrationService);

    constructor() {
        s_applicationId = 1;
        _setupRole(OWNER, msg.sender);
    }

    modifier onlyOwner() {
        if(!hasRole(OWNER, msg.sender)) {
            revert CallerIsNotOwner();
        }
        _;
    }

    modifier serviceAddressIsNotZero() {
        if(s_rtoRegistrationService == address(0)) {
            revert ServiceAddressIsZero();
        }
        _;
    }

    function createNewRTOApplication(/*params*/) external onlyOwner serviceAddressIsNotZero {
        // create new RTOApplication
        RTOApplication newRTOApplication = new RTOApplication(/*params*/);
        uint256 currentApplicationId = s_applicationId;
        address rtoApplicationAddress = address(newRTOApplication);
        s_applications[currentApplicationId] = rtoApplicationAddress;
        emit RTOApplicationCreated(currentApplicationId);

        submitRTOApplication(rtoApplicationAddress, currentApplicationId);
        s_applicationId++;

    }

    // Internal use for submitting right after creation
    function submitRTOApplication(address rtoApplicationAddress, uint256 applicationId) internal {
        (bool success, ) = 
            s_rtoRegistrationService.call(
                abi.encodeWithSignature("registerLicenseAction(address)", rtoApplicationAddress)
            );
        if(success) {
            emit RTOApplicationSubmitted(applicationId);
        }
    }

    // If RTOApplication is created but somehow submit fails, owner can manually give applicationId,
    // to submit it.
    function submitRTOApplication(uint256 applicationId) external onlyOwner serviceAddressIsNotZero {

        if(s_applications[applicationId] == address(0)) {
            revert ApplicationDoesntExist();
        }
        (bool success, ) = 
            s_rtoRegistrationService.call(
                abi.encodeWithSignature("registerLicenseAction(address)", s_applications[applicationId])
            );
        if(success) {
            emit RTOApplicationSubmitted(applicationId);
        }
    }

    //In case of a new Factory being deployed, applicationId can be set manually to avoid clashes.
    function setApplicationId(uint256 applicationId) external {
        s_applicationId = applicationId;
        emit RTOApplicationIdChanged(applicationId);
    }

    function getApplicationId() external view returns(uint256) {
        return s_applicationId;
    }

    function setRTORegistrationService(address rtoRegistrationService) external {
        s_rtoRegistrationService = rtoRegistrationService;
        emit RTORegistrationServiceChanged(rtoRegistrationService);
    }

    function getRTORegistrationService() external view returns(address) {
        return s_rtoRegistrationService;
    }
    
}