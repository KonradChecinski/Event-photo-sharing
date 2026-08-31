<?php

namespace App\Http\Requests;

use App\Models\Event;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Event::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('image') && ! $this->file('image')) {
            $this->replace($this->except('image'));
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:3000'],
            'status' => ['required', Rule::in(['draft', 'active', 'inactive', 'finished'])],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'title' => ['nullable', 'string', 'max:160'],
            'text' => ['nullable', 'string', 'max:1000'],
            'welcome_title' => ['nullable', 'string', 'max:160'],
            'welcome_text' => ['nullable', 'string', 'max:1000'],
            'primary_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'secondary_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'text_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'background_color_primary' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'background_color_secondary' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            // image for the event settings
            'image' => ['nullable', 'image', 'max:5120'],
        ];
    }
}
