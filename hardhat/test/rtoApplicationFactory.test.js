
const { assert, expect } = require("chai")
const { getNamedAccounts, ethers } = require("hardhat")

describe("RTOApplicationFactory Unit Tests", function() {
    let deployer, rtoApplicationFactory, mockRTORegistrationService
    

    beforeEach(async() => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        const RTOApplicationFactoryFactory = await ethers.getContractFactory("RTOApplicationFactory")
        rtoApplicationFactory = await RTOApplicationFactoryFactory.deploy()
        const MockRTORegistrationServiceFactory = await ethers.getContractFactory("MockRTORegistrationService")
        mockRTORegistrationService = await MockRTORegistrationServiceFactory.deploy()
        await rtoApplicationFactory.setRTORegistrationService(mockRTORegistrationService.address)
    })

    describe("Constructor", () => {
        it("sets applicationId to the correct initial value", async function () {
            const applicationId = await rtoApplicationFactory.getApplicationId()
            assert.equal(applicationId, 1)
        })

        it("sets the owner role correctly", async function () {
            const ownerRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('OWNER'))
            const isOwner = await rtoApplicationFactory.hasRole(ownerRole, deployer.address)
            assert.equal(isOwner, true)
        })
    })

    describe("Getters and Setters", () => {

        describe("RTO Registration Service", () => {
            describe("setRTORegistrationService", () => {
                it("sets address correctly", async function () {
                    await expect(rtoApplicationFactory.setRTORegistrationService(ethers.constants.AddressZero))
                        .to
                        .emit(rtoApplicationFactory, "RTORegistrationServiceChanged")
                        .withArgs(ethers.constants.AddressZero)
                    assert.equal(await rtoApplicationFactory.getRTORegistrationService(), ethers.constants.AddressZero)
                })
            }),
            describe("getRTORegistrationService", () => {
                it("gets correct address", async function () {
                    const expectedServiceAddress = mockRTORegistrationService.address; 
                    assert.equal(await rtoApplicationFactory.getRTORegistrationService(), expectedServiceAddress)
                })
            })
        }),

        describe("Application ID", () => {
            describe("setApplicationId", () => {
                it("sets applicationId correctly", async function () {
                    await expect(rtoApplicationFactory.setApplicationId(11))
                        .to
                        .emit(rtoApplicationFactory, "RTOApplicationIdChanged")
                        .withArgs(11)
                    assert.equal(await rtoApplicationFactory.getApplicationId(), 11)
                })
            }),
            describe("getApplicationId", () => {
                it("gets correct applicationId", async function () {
                    const expectedValue = 1; 
                    assert.equal(await rtoApplicationFactory.getApplicationId(), expectedValue)
                })
            })
        })
        
    })
})