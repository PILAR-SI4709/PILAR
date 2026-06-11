@Get()
async findAll() {
  return this.eventsService.findAll(); 
}

@Get(':id')
async findOne(@Param('id') id: string) {
  return this.eventsService.findOne(id); 
}