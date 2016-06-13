selenium = require 'selenium-webdriver'
chai = require 'chai'
chai.use require 'chai-as-promised'
expect = chai.expect

before ->
  @timeout 10000
  # create driver
  @driver = new selenium.Builder()
    .forBrowser('firefox')
    .build()
  @driver.getWindowHandle()

after ->
#close window
  @driver.quit()

describe 'Dreamjob Deliverer Tests', ->
  beforeEach ->
    @driver.get 'localhost:5000'

  it 'has the title', ->
    expect(@driver.getTitle()).to.eventually.contain 'Dreamjob Deliverer'

  it 'has create test button', ->
    text = @driver.findElement(id: 'create-new-test').getText()
    expect(text).to.eventually.equal 'Create New Test'

  it 'goes to create test page upon click', ->
    @driver.findElement(id: 'create-new-test').click()
    expect(@driver.getCurrentUrl()).to.eventually.equal 'http://localhost:5000/app/admin/create/'

  it 'goes back to admin page after cancelling creation', ->
    @driver.findElement(id: 'create-new-test').click()
    @driver.findElement(id: 'cancel').click()
    expect(@driver.getCurrentUrl()).to.eventually.equal 'http://localhost:5000/app/admin/'