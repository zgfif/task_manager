# frozen_string_literal: true

class ProjectsController < ApplicationController
  def index
    @projects = present_user.projects

    render json: @projects, status: :ok
  end

  def create
    @project = present_user.projects.new(project_params)

    if @project.save
      render json: @project, status: :created
    else
      render json: @project.errors, status: :conflict
    end
  end

  def destroy
    if project.destroy
      render json: project, status: :no_content
    else
      render json: project.errors, status: :accepted
    end
  end

  def update
    if project.update(project_params)
      render json: project, status: :ok
    else
      render json: project.errors, status: :conflict
    end
  end

  private

  def project
    @project ||= Project.find(params[:id])
  end

  def project_params
    params.require(:project).permit(:name)
  end
end