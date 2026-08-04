package br.com.gabrielfelix.ivoneide_pintura_api.order;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gabrielfelix.ivoneide_pintura_api.order.dto.OrderCreateRequest;
import br.com.gabrielfelix.ivoneide_pintura_api.order.dto.OrderResponse;
import br.com.gabrielfelix.ivoneide_pintura_api.order.dto.OrderStatusUpdateRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/pedidos")
public class OrderController {

	private final OrderService orderService;

	public OrderController(OrderService orderService) {
		this.orderService = orderService;
	}

	@PostMapping
	public ResponseEntity<OrderResponse> create(@Valid @RequestBody OrderCreateRequest request,
			Authentication authentication) {
		OrderResponse order = orderService.create(authentication.getName(), request);
		return ResponseEntity
				.created(URI.create("/api/pedidos/" + order.getId()))
				.body(order);
	}

	@GetMapping("/meus")
	public ResponseEntity<List<OrderResponse>> findMyOrders(Authentication authentication) {
		return ResponseEntity.ok(orderService.findMyOrders(authentication.getName()));
	}

	@GetMapping
	public ResponseEntity<List<OrderResponse>> findAll() {
		return ResponseEntity.ok(orderService.findAll());
	}

	@GetMapping("/{id}")
	public ResponseEntity<OrderResponse> findById(@PathVariable Long id, Authentication authentication) {
		return ResponseEntity.ok(orderService.findById(id, authentication.getName()));
	}

	@PatchMapping("/{id}/status")
	public ResponseEntity<OrderResponse> updateStatus(@PathVariable Long id,
			@Valid @RequestBody OrderStatusUpdateRequest request) {
		return ResponseEntity.ok(orderService.updateStatus(id, request));
	}
}
