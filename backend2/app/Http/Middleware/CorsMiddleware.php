<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): mixed
    {
    // Skip CORS completely for web routes (non-API routes)
    if (!$request->is('api/*')) {
        return $next($request);
    }

    // Handle preflight OPTIONS requests
    if ($request->isMethod('OPTIONS')) {
        return response('', 200)
            ->header('Access-Control-Allow-Origin', $this->getAllowedOrigins($request))
            ->header('Access-Control-Allow-Methods', $this->getAllowedMethods())
            ->header('Access-Control-Allow-Headers', $this->getAllowedHeaders())
            ->header('Access-Control-Expose-Headers', $this->getExposedHeaders())
            ->header('Access-Control-Allow-Credentials', $this->getSupportsCredentials())
            ->header('Access-Control-Max-Age', $this->getMaxAge());
    }

    $response = $next($request);

    // Add CORS headers only to API responses
    $response->headers->set('Access-Control-Allow-Origin', $this->getAllowedOrigins($request));
    $response->headers->set('Access-Control-Allow-Methods', $this->getAllowedMethods());
    $response->headers->set('Access-Control-Allow-Headers', $this->getAllowedHeaders());
    $response->headers->set('Access-Control-Expose-Headers', $this->getExposedHeaders());
    $response->headers->set('Access-Control-Allow-Credentials', $this->getSupportsCredentials());
    $response->headers->set('Access-Control-Max-Age', $this->getMaxAge());

    return $response;
    }

    /**
     * Get allowed origins based on configuration and request
     */
    private function getAllowedOrigins(Request $request): string
    {
        $allowedOrigins = Config::get('cors.allowed_origins', ['*']);
        $allowedPatterns = Config::get('cors.allowed_origins_patterns', []);

        // Check if the request origin matches any pattern
        foreach ($allowedPatterns as $pattern) {
            if (preg_match($pattern, $request->header('Origin', ''))) {
                return $request->header('Origin', '');
            }
        }

        // Check if origin is in allowed origins list
        if (in_array('*', $allowedOrigins) || in_array($request->header('Origin', ''), $allowedOrigins)) {
            return $request->header('Origin', '');
        }

        return '';
    }

    /**
     * Get allowed methods
     */
    private function getAllowedMethods(): string
    {
        return implode(', ', Config::get('cors.allowed_methods', ['*']));
    }

    /**
     * Get allowed headers
     */
    private function getAllowedHeaders(): string
    {
        return implode(', ', Config::get('cors.allowed_headers', ['*']));
    }

    /**
     * Get exposed headers
     */
    private function getExposedHeaders(): string
    {
        return implode(', ', Config::get('cors.exposed_headers', ['*']));
    }

    /**
     * Get supports credentials setting
     */
    private function getSupportsCredentials(): string
    {
        return Config::get('cors.supports_credentials', true) ? 'true' : 'false';
    }

    /**
     * Get max age
     */
    private function getMaxAge(): int
    {
        return Config::get('cors.max_age', 86400);
    }
}