#initial setup
selenium = require 'selenium-webdriver'
chai = require 'chai'
chai.use require 'chai-as-promised'
expect = chai.expect

#creates web driver
before ->
  @timeout 10000
  # create driver
  @driver = new selenium.Builder()
    .withCapabilities(selenium.Capabilities.chrome())
    .build()
  @driver.getWindowHandle()

#closes the window after testing has finished
after ->
#close window
  @driver.quit()

describe 'Dreamjob Deliverer Tests', ->
#open the page before running the tests
  beforeEach ->
    @driver.get 'localhost:5000'

#checking that the title is what it should be
  it 'has the title', ->
    expect(@driver.getTitle()).to.eventually.contain 'Dreamjob Deliverer'

#checks that create test button exists and is found on page
  it 'has create test button', ->
    text = @driver.findElement(id: 'create-new-test').getText()
    expect(text).to.eventually.equal 'Create New Test'

#checks that it gets routed to the create test page after clicking
  it 'goes to create test page upon click', ->
    @driver.findElement(id: 'create-new-test').click()
    expect(@driver.getCurrentUrl()).to.eventually.equal 'http://localhost:5000/app/admin/create/'

#checking that it gets routed back to the default admin page when cancelling the creation of a test
  it 'goes back to admin page after cancelling creation', ->
    @driver.findElement(id: 'create-new-test').click()
    @driver.findElement(id: 'cancel').click()
    expect(@driver.getCurrentUrl()).to.eventually.equal 'http://localhost:5000/app/admin/'

#Checking that the scheduled tests tab is present
  it 'has the Scheduled tests tab', ->
    text = @driver.findElement(linkText: 'Scheduled').getText()
    expect(text).to.eventually.equal 'Scheduled'

#Checking that the in-progress tests tab is present
  it 'has the In-Progress tests tab', ->
    text = @driver.findElement(linkText: 'In-Progress').getText()
    expect(text).to.eventually.equal 'In-Progress'


#Checking that the finished tests tab is present
  it 'has the Finished tests tab', ->
    text = @driver.findElement(linkText: 'Finished').getText()
    expect(text).to.eventually.equal 'Finished'

#checking that the page moves to a schedule page after hitting a schedule button
  it 'finds and gets routed to a schedule button on the page', ->
    @driver.findElement(xpath: '//div[@id="test-list"]/a[1]/button').click()
    expect(@driver.getCurrentUrl()).to.eventually.contain 'http://localhost:5000/app/admin/schedule'