class Channel:
    def __init__(self, channelName):
        self.messages = []
        self.channelName = channelName

    def addMessage(self, message):
        if (len(messages) <= 100): 
            self.messages.append(message)
        if (len(messages) >= 100):
            self.messages.pop(0)



