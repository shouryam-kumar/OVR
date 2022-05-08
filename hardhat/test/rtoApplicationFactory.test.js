
const { assert, expect } = require("chai")
const { getNamedAccounts, ethers } = require("hardhat")

describe("RTOApplicationFactory Unit Tests", function() {
    let deployer, dummy, rtoApplicationFactory, mockRTORegistrationService
    

    beforeEach(async() => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        dummy = accounts[1]
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

    describe("Creating and Submitting Application", () => {
        describe("Creating an RTO Application", () => {
            describe("createNewRTOApplication", () => {
                it("can only be called by owner", async function () {
                    await expect(rtoApplicationFactory.createNewRTOApplication())
                        .to
                        .not
                        .be
                        .revertedWith("")
                    await expect(rtoApplicationFactory.connect(dummy).createNewRTOApplication())
                        .to
                        .be
                        .revertedWith("")
                }),
                it("reverts when service address is zero", async function () {
                    await rtoApplicationFactory.setRTORegistrationService(ethers.constants.AddressZero)
                    await expect(rtoApplicationFactory.createNewRTOApplication())
                        .to
                        .be
                        .revertedWith("")
                }),
                it("emits creation event", async function () {
                    await expect(rtoApplicationFactory.createNewRTOApplication())
                        .to
                        .emit(rtoApplicationFactory, "RTOApplicationCreated")
                        .withArgs(1)
                }),
                it("increments the id correctly", async function () {
                    await rtoApplicationFactory.createNewRTOApplication()
                    assert.equal(await rtoApplicationFactory.getApplicationId(), 2)
                })

            })
        }),

        describe("Submitting an RTO Application", () => {
            describe("submitRTOApplication", () => {
                it("can only be called by owner", async function () {
                    await rtoApplicationFactory.createNewRTOApplication()
                    await expect(rtoApplicationFactory.submitRTOApplication(1))
                        .to.not.be.revertedWith("")
                    await expect(rtoApplicationFactory.connect(dummy).submitRTOApplication(0))
                        .to.be.revertedWith("")
                }),
                it("reverts when invalid Id is provided", async function () {
                    await expect(rtoApplicationFactory.submitRTOApplication(12312))
                        .to.be.revertedWith("")
                })
            })
        })
    })
})