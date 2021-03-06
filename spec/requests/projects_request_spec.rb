# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Projects', type: :request do
  let!(:user) { create(:user) }
  let!(:second_user) { create(:user) }
  let!(:project) { create(:project, user: user) }
  let!(:second_project) { create(:project, user: second_user) }
  let!(:name_error) { 'is too short (minimum is 3 characters)' }
  let!(:project_params) { { project: { name: '' } } }

  before(:each) do
    allow_any_instance_of(ProjectsController)
      .to receive(:current_user).and_return(user)
    allow_any_instance_of(ProjectsController)
      .to receive(:authenticate_request).and_return(user)
  end

  it 'should return all related to current_user projects' do
    get '/projects'
    responsed_project = response_body[0]

    expect(response_body.count).to eq(1)
    expect(project.id).to eq(responsed_project['id'])
    expect(response.status).to eq(200)
  end

  context 'creation' do
    it 'with correct project name' do
      project_params[:project][:name] = 'the second project'
      post '/projects', params: project_params

      expect(response_body['name']).to eq(project_params[:project][:name])
      expect(response.status).to eq(201)
    end

    it 'with incorrect(too short) project name' do
      project_params[:project][:name] = 'th'
      post '/projects', params: project_params

      expect(response_body['name'][0]).to eq(name_error)
      expect(response.status).to eq(409)
    end
  end

  context 'updating' do
    it 'with correct project name' do
      project_params[:project][:name] = 'altered project'
      patch "/projects/#{project.id}", params: project_params

      expect(response_body['name']).to eq(project_params[:project][:name])
      expect(response.status).to eq(200)
    end

    it 'with incorrect(too short) project name' do
      project_params[:project][:name] = 'al'
      patch "/projects/#{project.id}", params: project_params

      expect(response_body['name'][0]).to eq(name_error)
      expect(response.status).to eq(409)
    end
  end

  it 'should destroy existing project' do
    delete "/projects/#{project.id}"

    expect(user.projects.count).to eq(0)
    expect(Project.count).to eq(1)
    expect(response.status).to eq(204)
  end

  it 'should NOT destroy existing project' do
    delete '/projects/invalid_id'

    expect(user.projects.count).to eq(1)
    expect(Project.count).to eq(2)
    expect(response.status).to eq(202)
  end
end
